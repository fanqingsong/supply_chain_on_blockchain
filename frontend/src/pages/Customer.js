import React from "react";

import { ethers } from "ethers";

import SupplyChainArtifact from "../contracts/SupplyChain.json";
import contractAddress from "../contracts/contract-address.json";

import { Loading } from "../components/Loading";

import { TransactionErrorMessage } from "../components/TransactionErrorMessage";
import { WaitingForTransactionMessage } from "../components/WaitingForTransactionMessage";

import {
  Box,
  Flex,
  Image,
  Card,
  Table,
  Heading,
  Tooltip,
  Form,
  Input,
  Select,
  Field,
  Button,
  Text,
  Checkbox,
  ToastMessage,
  Radio
} from "rimble-ui";


const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

export class Customer extends React.Component {
  constructor(props) {
    super(props);

    this.initialState = {
      contractOwner: undefined,

      // product list 
      ManufacturerProductListData: undefined,

      // for getting manufacturer users
      UserListData: undefined,

      txBeingSent: undefined,
      transactionError: undefined,
      networkError: undefined,
    };

    this.state = this.initialState;
  }

  async onManufacturerProductReceive(batchId) {
    await this._SupplyChain.productBatchReceived(batchId);

    this._getManufacturerProductListData()

    window.toastProvider.addMessage("Processing transaction...", {
      secondaryMessage: "Please wait a moment.",
      // actionHref:
      //   "https://etherscan.io/tx/0xcbc921418c360b03b96585ae16f906cbd48c8d6c2cc7b82c6db430390a9fcfed",
      // actionText: "Check",
      variant: "processing"
    })
  }

  translateBatchStatus(batchStatus) {
    console.log("batchStatus=", batchStatus)
    batchStatus = batchStatus.toNumber();

    if (batchStatus === 0) {
      return "not received";
    } else if (batchStatus === 1) {
      return "received";
    } else {
      return "";
    }
  }

  getBatchInfoStr(oneBatch) {
    let batchInfo = oneBatch.batchInfo;
    console.log(batchInfo);

    let description = batchInfo.Des;
    let quantity = batchInfo.Quant;
    let receiver = batchInfo.Rcvr;

    return `
      Description: ${description}
      Quantity: ${quantity}
      Receiver: ${receiver}
    `
  }

  render() {
    let ManufacturerProductListData = this.state.ManufacturerProductListData;
    console.log("--------------ManufacturerProductListData")
    console.log(ManufacturerProductListData);

    return (
      <Box width={1}>
        <Box p={4} bg="Azure">
          <ToastMessage.Provider ref={node => (window.toastProvider = node)} />
          <Box>
            <Heading as={"h3"}>My Products from Manufacturer</Heading>
            <Table width={1}>
              <thead>
                <tr>
                  <th width={0.2}>Batch Address</th>
                  <th width={0.2}>Status</th>
                  <th width={0.2}>Action</th>
                </tr>
              </thead>
              <tbody>
                { ManufacturerProductListData && 
                    ManufacturerProductListData.batches.map((oneBatch, index) => {
                      return (
                        <tr key={index.toString()}>
                            <td>
                              <Text style={{overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}} title={this.getBatchInfoStr(oneBatch)}>
                                {oneBatch.batchId}
                              </Text>
                            </td>
                            <td>
                              <Text style={{overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}} title={this.translateBatchStatus(oneBatch.batchStatus)}>
                                {this.translateBatchStatus(oneBatch.batchStatus)}
                              </Text>
                            </td>
                            <td>
                              <Button size="small" mr={3} disabled={oneBatch.batchStatus.toNumber()===1} onClick={this.onManufacturerProductReceive.bind(this, oneBatch.batchId)}>
                                Receive
                              </Button>
                            </td>
                        </tr>
                      )
                    })
                }

                { ManufacturerProductListData && ManufacturerProductListData.batches.length>0 || (
                          <tr>
                            <td colSpan="3" style={{"textAlign":"center"}}>No Product</td>
                          </tr>
                )}
              </tbody>
            </Table>
          </Box>
        </Box>
      </Box>
    );
  }

  componentDidMount() {
    this._initialize()
  }

  componentWillUnmount() {
    // We poll the user's balance, so we have to stop doing that when Dapp
    // gets unmounted
    this._stopPollingData();

    this.setState = (state,callback)=>{
      return;
    };
  }

  async _getUserListData() {
    let userCount = await this._SupplyChain.getUsersCount();

    console.log("--- userCount:")
    console.log(userCount.toNumber())

    userCount = userCount.toNumber();

    let users = []
    let suppliers = []
    let manufacturers = []
    let customers = []
    for(let i=0; i<userCount; i++) {
        const user = await this._SupplyChain.getUserbyIndex(i);

        console.log(user)
        // console.log(device.id.toNumber())
        // console.log(device.deviceName)
        // console.log(device.completed)

        let one_user = {
            name: user.name,
            location: user.location,
            ethAddress: user.ethAddress,
            role: user.role,
            disabled: user.disabled
        }

        users.push(one_user);

        if (user.role === 3) {
          manufacturers.push(one_user);
        } else if (user.role === 2) {
          suppliers.push(one_user);
        } else if (user.role === 4) {
          customers.push(one_user);
        }
    }

    console.log("---before setState -----")

    this.setState({ UserListData: { userCount, users, suppliers, manufacturers, customers } });
  }

  async _initialize() {
    console.log("enter initialize");

    await this._intializeEthers();

    try {
      await this._SupplyChain.deployed();

      let Owner = await this._SupplyChain.Owner();
      this.setState({Owner})
      console.log("Owner addr=", Owner);
      
      await this._getUserListData();

      this._getManufacturerProductListData();

      this._startPollingData();

    } catch (error) {
      this.setState({ networkError: 'Token contract not found on this network.' });
    }
  }

  async _intializeEthers() {
    // We first initialize ethers by creating a provider using window.ethereum
    this._provider = new ethers.providers.Web3Provider(window.ethereum);

    // We initialize the contract using the provider and the token's
    // artifact and address. You can do this same thing with your contracts.
    this._SupplyChain = await new ethers.Contract(
      contractAddress.SupplyChain,
      SupplyChainArtifact.abi,
      this._provider.getSigner(0)
    );

    this._SupplyChain.on("BatchReceived", ()=>{
      console.log("!!!!! event called by BatchReceived")
      window.toastProvider.removeMessage();

      this._getManufacturerProductListData();
    })
  }

  _startPollingData() {
    this._pollDataInterval = setInterval(() => this._getManufacturerProductListData(), 10000);

    this._getManufacturerProductListData();
  }

  _stopPollingData() {
    clearInterval(this._pollDataInterval);
    this._pollDataInterval = undefined;
  }

  async _getManufacturerProductListData() {
    let UserListData = this.state.UserListData;
    if(!UserListData){
      return;
    }

    let manufacturers = UserListData.manufacturers;

    let batches = []
    for (let one_manufacturer of manufacturers) {
      console.log("one_manufacturer=", one_manufacturer)
      
      let ethAddress = one_manufacturer.ethAddress;

      let packageCount = await this._SupplyChain.getBatchesCountM_SID(ethAddress);
  
      console.log("--- packageCount:")
      console.log(packageCount.toNumber())
  
      packageCount = packageCount.toNumber();
    
      for(let i=0; i<packageCount; i++) {
          const batchId = await this._SupplyChain.getBatchIdByIndexM_SID(ethAddress, i);
  
          const batchInfo = await this._SupplyChain.getProductInfoById(batchId);
          const batchStatus = await this._SupplyChain.getProductStatusById(batchId);
  
          console.log("batchId, batchInfo, batchStatus =", batchId, batchInfo, batchStatus)

          batches.push({batchId, batchStatus, batchInfo})
      }
    }

    console.log("---before setState -----")
    this.setState({ ManufacturerProductListData: { batches } });
  }

  _dismissTransactionError() {
    this.setState({ transactionError: undefined });
  }

  _dismissNetworkError() {
    this.setState({ networkError: undefined });
  }

  _resetState() {
    this.setState(this.initialState);
  }
}
