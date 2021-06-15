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
  Radio
} from "rimble-ui";


const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

export class Manufacturer extends React.Component {
  constructor(props) {
    super(props);

    this.initialState = {
      contractOwner: undefined,

      // for display all incoming package from suppliers
      SupplierPackageListData: undefined,

      // product list 
      ProductListData: undefined,

      // for creating new user
      newDescription: "BBU",
      newQuantity: 1,
      newCustomer: "",

      // for getting manufacturer users
      UserListData: undefined,

      txBeingSent: undefined,
      transactionError: undefined,
      networkError: undefined,
    };

    this.state = this.initialState;

    this.onNewDescriptionChange = this.onNewDescriptionChange.bind(this);
    this.onNewQuantityChange = this.onNewQuantityChange.bind(this);
    this.onNewCustomerChange = this.onNewCustomerChange.bind(this);
    
    this.onNewBatchSubmit = this.onNewBatchSubmit.bind(this);
    this.onFormSubmit = this.onFormSubmit.bind(this);
  }

  async onSupplierPackageReceive(packageId) {
    await this._SupplyChain.rawPackageReceived(packageId);

    this._getSupplierPackageListData()
  }

  onNewDescriptionChange(e) {
    let newDescription = e.target.value;

    this.setState({newDescription})
  }

  onNewQuantityChange(e) {
    let newQuantity = e.target.value;

    this.setState({"newQuantity": newQuantity})
  }

  onNewCustomerChange(ethAddress) {
    console.log("user change manufacturer to", ethAddress)
    let newCustomer = ethAddress;

    this.setState({newCustomer})
  }

  async onNewBatchSubmit(e) {
    let newDescription = this.state.newDescription;
    let newQuantity = this.state.newQuantity;
    let newCustomer = this.state.newCustomer;

    let newBatch = {
      newDescription,
      newQuantity,
      newCustomer
    }

    console.log("=============== newBatch")
    console.log(newBatch)

    await this._createBatch(newBatch);

    this._getProductListData();
  }

  onFormSubmit(e) {
    e.preventDefault();
  }

  translatePackageStatus(packageStatus) {
    console.log("packageStatus=", packageStatus)
    packageStatus = packageStatus.toNumber();

    if (packageStatus === 0) {
      return "not received";
    } else if (packageStatus === 1) {
      return "received";
    } else {
      return "";
    }
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

  getPackageInfoStr(onePackage) {
    let packageInfo = onePackage.packageInfo;
    console.log(packageInfo);

    let description = packageInfo.Des;
    description = ethers.utils.parseBytes32String(description);
    
    let factoryName = packageInfo.FN;
    factoryName = ethers.utils.parseBytes32String(factoryName);

    let location = packageInfo.Loc;
    location = ethers.utils.parseBytes32String(location);

    let quantity = packageInfo.Quant;
    let receiver = packageInfo.Rcvr;
    let supplier = packageInfo.Splr;

    return `
      Description: ${description}
      factoryName: ${factoryName}
      Location: ${location}
      Quantity: ${quantity}
      Receiver: ${receiver}
      Supplier: ${supplier}
    `
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
    let SupplierPackageListData = this.state.SupplierPackageListData;
    console.log("--------------SupplierPackageListData")
    console.log(SupplierPackageListData);

    let ProductListData = this.state.ProductListData;
    console.log("----------- ProductListData", ProductListData)

    let UserListData = this.state.UserListData;

    let newDescription = this.state.newDescription;
    let newQuantity = this.state.newQuantity;

    return (
      <Box width={1}>
        <Box p={4} bg="Azure">
          <Box>
            <Heading as={"h3"}>My Packages from Supplier</Heading>
            <Table width={1}>
              <thead>
                <tr>
                  <th width={0.2}>Package Address</th>
                  <th width={0.2}>Status</th>
                  <th width={0.2}>Action</th>
                </tr>
              </thead>
              <tbody>
                { SupplierPackageListData && 
                    SupplierPackageListData.packages.map((onePackage, index) => {
                      return (
                        <tr key={index.toString()}>
                            <td>
                              <Text style={{overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}} title={this.getPackageInfoStr(onePackage)}>
                                {onePackage.packageId}
                              </Text>
                            </td>
                            <td>
                              <Text style={{overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}} title={this.translatePackageStatus(onePackage.packageStatus)}>
                                {this.translatePackageStatus(onePackage.packageStatus)}
                              </Text>
                            </td>
                            <td>
                              <Button size="small" mr={3} disabled={onePackage.packageStatus.toNumber()===1} onClick={this.onSupplierPackageReceive.bind(this, onePackage.packageId)}>
                                Receive
                              </Button>
                            </td>
                        </tr>
                      )
                    })
                }

                { SupplierPackageListData && SupplierPackageListData.packages.length>0 || (
                          <tr>
                            <td colSpan="4" style={{"textAlign":"center"}}>No Package</td>
                          </tr>
                )}
              </tbody>
            </Table>
          </Box>

          <Box>&nbsp;</Box>
          <Box mt={40}>
            <Heading as={"h3"}>Product Batches</Heading>
            <Table width={1}>
              <thead>
                <tr>
                  <th width={0.2}>Batch Address</th>
                  <th width={0.2}>Status</th>
                </tr>
              </thead>
              <tbody>
                { ProductListData && 
                    ProductListData.batches.map((oneBatch, index) => {
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
                        </tr>
                      )
                    })
                }

                { ProductListData && ProductListData.batches.length>0 || (
                          <tr>
                            <td colSpan="2" style={{"textAlign":"center"}}>No Product</td>
                          </tr>
                )}
              </tbody>
            </Table>
          </Box>

          <Box>&nbsp;</Box>
          <Box mt={40}>
            <Heading as={"h3"}>Create Product Batch</Heading>
            <Form onSubmit={this.onFormSubmit}>
              <Flex mx={-3} flexWrap={"wrap"}>
                <Box width={[1, 1, 1]} px={3}>
                  <Field label="Description"  width={1}>
                    <Input
                      type="text"
                      required // set required attribute to use brower's HTML5 input validation
                      onChange={this.onNewDescriptionChange}
                      value={newDescription}
                      width={1}
                    />
                  </Field>
                </Box>
                <Box width={[1, 1, 1]} px={3}>
                  <Field label="Quantity"  width={1}>
                    <Input
                      type="number"
                      required // set required attribute to use brower's HTML5 input validation
                      onChange={this.onNewQuantityChange}
                      value={newQuantity}
                      width={1}
                    />
                  </Field>
                </Box>
                <Box width={[1, 1, 1]} px={3}>
                  <Field label="Manufacturer" width={1}>
                    <Box required={true}>
                      {
                        UserListData && UserListData.customers.map((one_user, index)=>{
                          return (
                            <Radio key={index.toString()} label={one_user.name+"("+one_user.ethAddress+")"}
                              onChange={this.onNewCustomerChange.bind(this, one_user.ethAddress)}
                              />  
                          )
                        })
                      }
                    </Box>
                  </Field>
                </Box>
              </Flex>
              <Box>
                <Button type="submit" onClick={this.onNewBatchSubmit}>
                  Create
                </Button>
              </Box>
            </Form>
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

      this._getSupplierPackageListData();

      this._getProductListData();

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
    this._pollDataInterval = setInterval(() => this._getSupplierPackageListData(), 10000);

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

  async _getProductListData() {
    let batches = []
    let batchCount = await this._SupplyChain.getBatchesCountM();
  
    console.log("--- batchCount:")
    console.log(batchCount.toNumber())

    batchCount = batchCount.toNumber();
  
    for(let i=0; i<batchCount; i++) {
        const batchId = await this._SupplyChain.getBatchIdByIndexM(i);

        const batchInfo = await this._SupplyChain.getProductInfoById(batchId);
        const batchStatus = await this._SupplyChain.getProductStatusById(batchId);

        console.log("batchId, batchInfo, batchStatus =", batchId, batchInfo, batchStatus)

        batches.push({batchId, batchStatus, batchInfo})
    }

    console.log("---before setState -----")
    this.setState({ ProductListData: { batches } });
  }

  async _createBatch(newPackage) {
    try {
      this._dismissTransactionError();

      let newDescription = newPackage.newDescription;
      let newQuantity = newPackage.newQuantity;
      let newCustomer = newPackage.newCustomer;
  
      const tx = await this._SupplyChain.manufactureProduct(
        newDescription, newQuantity, newCustomer);

      this.setState({ txBeingSent: tx.hash });

      const receipt = await tx.wait();

      if (receipt.status === 0) {
        throw new Error("Transaction failed");
      }
    } catch (error) {
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }

      console.error(error);
      this.setState({ transactionError: error });
    } finally {
      this.setState({ txBeingSent: undefined });
    }
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
