import React from "react";

import { ethers } from "ethers";

import SupplyChainArtifact from "../contracts/SupplyChain.json";
import contractAddress from "../contracts/contract-address.json";

import { Flowpoint, Flowspace } from 'flowpoints';

import { Loading } from "../components/Loading";

import { TransactionErrorMessage } from "../components/TransactionErrorMessage";
import { WaitingForTransactionMessage } from "../components/WaitingForTransactionMessage";

import {
  Box,
  Flex,
  Image,
  Card,
  Heading,
  Icon,
  Table,
  MetaMaskButton,
  ToastMessage,
  Avatar,
  Flash,
  Form,
  Input,
  Select,
  Field,
  Button,
  Text,
  Checkbox,
  Radio
} from "rimble-ui";


const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

export class Overview extends React.Component {
  constructor(props) {
    super(props);

    this.initialState = {
      // product list 
      ManufacturerProductListData: undefined,

      // for getting manufacturer users
      UserListData: undefined,

      // for flowchart
      oneBatch: undefined,
      dependedPackages: undefined,

      txBeingSent: undefined,
      transactionError: undefined,
      networkError: undefined,
    };

    this.state = this.initialState;
  }

  async onManufacturerProductInspect(oneBatch) {
    this.setState({oneBatch});

    let rawMaterials = oneBatch.batchInfo.RM;
    console.log("====rawMaterials:", rawMaterials)

    let SupplierPackageListData = this.state.SupplierPackageListData;
    console.log("====SupplierPackageListData:", SupplierPackageListData)

    let ProductPackageListData = [];
    for (let packageId of rawMaterials) {
      console.log("====packageId:", packageId)

      let onePackage = SupplierPackageListData.packages.filter((oneItem)=>{
        return oneItem.packageId === packageId;
      })

      if (onePackage.length > 0) {
        onePackage = onePackage[0];

        console.log("====onePackage:", onePackage)
        let packageInfo = onePackage.packageInfo;
        console.log("====packageInfo:", packageInfo)

        let description = packageInfo.Des;
        description = ethers.utils.parseBytes32String(description);
        onePackage.packageInfo.Des = description;

        let factoryName = packageInfo.FN;
        factoryName = ethers.utils.parseBytes32String(factoryName);
        onePackage.packageInfo.FN = factoryName;
    
        let location = packageInfo.Loc;
        location = ethers.utils.parseBytes32String(location);
        onePackage.packageInfo.Loc = location;

        let quantity = packageInfo.Quant;
        quantity = quantity.toNumber();
        onePackage.packageInfo.Loc = quantity;

        ProductPackageListData.push(onePackage);
      }
    }

    console.log("====ProductPackageListData:", ProductPackageListData)

    this.setState({ProductPackageListData})
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

    let manufacturer = batchInfo.Manu;
    let description = batchInfo.Des;
    let quantity = batchInfo.Quant;
    let receiver = batchInfo.Rcvr;

    return `
      Manufacturer: ${manufacturer}
      Description: ${description}
      Quantity: ${quantity}
      Receiver: ${receiver}
    `
  }

  render() {
    let ManufacturerProductListData = this.state.ManufacturerProductListData;
    console.log("--------------ManufacturerProductListData")
    console.log(ManufacturerProductListData);

    let oneBatch = this.state.oneBatch;

    let ProductPackageListData = this.state.ProductPackageListData;
    console.log("--------------ProductPackageListData")
    console.log(ProductPackageListData);

    return (
      <Box width={0.8} px={80} bg="Azure">
        <Box p={4}>
          <Box>
            <Heading as={"h3"}>Inspect Product</Heading>
            <Card>
              <Box m={1}>
                <Flash my={3} variant="info">
                  Please select one product to inspect it, and see the flowchart of supply in the below.
                </Flash>
                <Box mt={1}>
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
                                    <Button size="small" mr={3} disabled={oneBatch.batchStatus.toNumber()===1} onClick={this.onManufacturerProductInspect.bind(this, oneBatch)}>
                                      Inspect
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
            </Card>
          </Box>      

          <Box mt={4}>
            <Heading as={"h4"}>Flowchart of Supply for Product</Heading>
            {
              oneBatch && (
                <Flowspace
                  theme="indigo"
                  variant="outlined"
                  background="white"
                  arrowStart={false}
                  arrowEnd={true}
                  style={{ width:'47vw', height:'50vh' }}
                  className="nodrag"
                >
                  {
                    ProductPackageListData 
                    && ProductPackageListData.map((onePackage)=>{
                      return (
                        <Flowpoint 
                          key="point_a" 
                          theme="indigo"
                          variant="filled"
                          startPosition={{ x:50, y:100 }}
                          width={300}
                          height={100}     
                          dragX={false}
                          dragY={false}
                          outputs={[oneBatch.batchId]} 
                          className="nodrag">
                          {
                            "Supplier:"+ onePackage.packageInfo.Splr 
                            + "\r\n"
                            + "Description:" + onePackage.packageInfo.Des
                            + "\r\n"
                            + "Quantity:" + onePackage.packageInfo.Quant
                            + "\r\n"
                            + "FactoryName:" + onePackage.packageInfo.FN
                            + "\r\n"
                            + "Location:" + onePackage.packageInfo.Loc
                            + "\r\n"
                            + "Receiver:" + onePackage.packageInfo.Rcvr
                          }

                        </Flowpoint>
                      )
                    })
                  }

                  {
                    // product block
                  }
                  <Flowpoint 
                    key={oneBatch.batchId} 
                    theme="indigo"
                    variant="filled"
                    dragX={false}
                    dragY={false}
                    startPosition={{ x:450, y:100 }}
                    width={300}
                    height={100}
                    className="nodrag" >
                    {
                      "Manufacturer:"+ oneBatch.batchInfo.Manu 
                      + "\r\n"
                      + "Description:" + oneBatch.batchInfo.Des
                      + "\r\n"
                      + "Quantity:" + oneBatch.batchInfo.Quant
                      + "\r\n"
                      + "Receiver:" + oneBatch.batchInfo.Rcvr
                    }
                  </Flowpoint>  
                </Flowspace>
              )
            }


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

    console.log("!!!!!!!!!!!--- userCount:")
    console.log(userCount.toNumber())

    userCount = userCount.toNumber();

    let users = []
    let suppliers = []
    let manufacturers = []
    let customers = []
    for(let i=0; i<userCount; i++) {
        const user = await this._SupplyChain.getUserbyIndex(i);

        console.log(user)

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
    await this._intializeEthers();

    try {
      await this._SupplyChain.deployed();
      
      await this._getUserListData();

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
  }

  _startPollingData() {
    this._pollDataInterval = setInterval(() => {
      this._getManufacturerProductListData();
      this._getSupplierPackageListData();
    }, 10000);

    this._getManufacturerProductListData();
    this._getSupplierPackageListData();
  }

  _stopPollingData() {
    clearInterval(this._pollDataInterval);
    this._pollDataInterval = undefined;
  }

  async _getSupplierPackageListData() {
    let UserListData = this.state.UserListData;
    let suppliers = UserListData.suppliers;

    let packages = []
    for (let one_supplier of suppliers) {
      console.log("one_supplier", one_supplier)
      let ethAddress = one_supplier.ethAddress;

      let packageCount = await this._SupplyChain.getPackagesCountS_SID(ethAddress);
  
      console.log("--- packageCount:")
      console.log(packageCount.toNumber())
  
      packageCount = packageCount.toNumber();
    
      for(let i=0; i<packageCount; i++) {
          const packageId = await this._SupplyChain.getPackageIdByIndexS_SID(ethAddress, i);
  
          const packageInfo = await this._SupplyChain.getPackageInfoByIdS(packageId);
          const packageStatus = await this._SupplyChain.getPackageStatusByIdS(packageId);
  
          console.log(packageId, packageInfo, packageStatus)
          packages.push({packageId, packageStatus, packageInfo})
      }
    }

    console.log("---before setState -----")
    this.setState({ SupplierPackageListData: { packages } });
  }

  async _getManufacturerProductListData() {
    let UserListData = this.state.UserListData;
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
