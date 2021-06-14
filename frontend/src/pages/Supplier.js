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

export class Supplier extends React.Component {
  constructor(props) {
    super(props);

    this.initialState = {
      contractOwner: undefined,

      // for display all users
      PackageListData: undefined,

      // for creating new user
      newDescription: "Radio Chipset",
      newFactoryName: "Qualcom",
      newLocation: "San Jose",
      newQuantity: 1,
      // 0x84fae3d3cba24a97817b2a18c2421d462dbbce9f
      newManufacturer: undefined,

      // for getting manufacturer users
      UserListData: undefined,

      txBeingSent: undefined,
      transactionError: undefined,
      networkError: undefined,
    };

    this.state = this.initialState;

    this.onNewDescriptionChange = this.onNewDescriptionChange.bind(this);
    this.onNewFactoryNameChange = this.onNewFactoryNameChange.bind(this);
    this.onNewLocationChange = this.onNewLocationChange.bind(this);
    this.onNewQuantityChange = this.onNewQuantityChange.bind(this);
    this.onNewManufacturerChange = this.onNewManufacturerChange.bind(this);
    
    this.onNewPackageSubmit = this.onNewPackageSubmit.bind(this);
    this.onFormSubmit = this.onFormSubmit.bind(this);
  }

  onNewDescriptionChange(e) {
    let newDescription = e.target.value;

    this.setState({newDescription})
  }

  onNewFactoryNameChange(e) {
    let newFactoryName = e.target.value;

    this.setState({newFactoryName})
  }

  onNewLocationChange(e) {
    let newLocation = e.target.value;

    this.setState({"newLocation": newLocation})
  }

  onNewQuantityChange(e) {
    let newQuantity = e.target.value;

    this.setState({"newQuantity": newQuantity})
  }

  onNewUserEtherAddressChange(e) {
    let newUserEtherAddress = e.target.value;

    this.setState({"newUserEtherAddress": newUserEtherAddress})
  }

  onNewManufacturerChange(ethAddress) {
    console.log("user change manufacturer to", ethAddress)
    let newManufacturer = ethAddress;

    this.setState({newManufacturer})
  }

  async onNewPackageSubmit(e) {
    let newDescription = this.state.newDescription;
    let newFactoryName = this.state.newFactoryName;
    let newLocation = this.state.newLocation;
    let newQuantity = this.state.newQuantity;
    let newManufacturer = this.state.newManufacturer;

    let newPackage = {
      newDescription,
      newFactoryName,
      newLocation,
      newQuantity,
      newManufacturer
    }

    console.log("=============== newPackage")
    console.log(newPackage)

    await this._createPackage(newPackage);

    // this.setState({'newUserName':""})
    // this.setState({'newUserLocation':""})
    // this.setState({'newUserEtherAddress':""})
    // this.setState({'newUserRole':1})

    this._getPackageListData();
  }

  onFormSubmit(e) {
    e.preventDefault();
  }

  translateRole(role) {
    if (role === 0) {
      return "norole";
    } else if (role === 1) {
      return "admin";
    } else if (role === 2) {
      return "supplier";
    } else if (role === 3) {
      return "manufacturer";
    }
  }

  render() {
    let PackageListData = this.state.PackageListData;
    console.log("--------------")
    console.log(PackageListData);

    let UserListData = this.state.UserListData;

    let newDescription = this.state.newDescription || "";
    let newFactoryName = this.state.newFactoryName || "";
    let newLocation = this.state.newLocation || "";
    let newQuantity = this.state.newQuantity || 0;

    return (
      <Box width={1}>
        <Box p={4} bg="Azure">
          <Box>
            <Heading as={"h3"}>Package List</Heading>
            <Table width={1}>
              <thead>
                <tr>
                  <th width={0.2}>Package Address</th>
                  {/* <th width={0.2}>Location</th>
                  <th width={0.4}>EtherAddress</th>
                  <th width={0.2}>Role</th> */}
                </tr>
              </thead>
              <tbody>
                { PackageListData && 
                        PackageListData.packages.map((onePackage, index) =>
                            <tr key={index.toString()}>
                              <td><Text style={{overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}} title={onePackage.packageId}>{onePackage.packageId}</Text></td>
                              {/* <td><Text width={"90px"} style={{overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}} title={oneUser.location}>{oneUser.location}</Text></td>
                              <td><Text width={"200px"} style={{overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}} title={oneUser.ethAddress}>{oneUser.ethAddress}</Text></td>
                              <td>
                                <Text width={"60px"} style={{overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}} title={this.translateRole(oneUser.role)}>
                                  {this.translateRole(oneUser.role)}
                                </Text>
                              </td> */}
                            </tr>
                          )
                    }

                { PackageListData && PackageListData.packageCount>0 || (
                          <tr>
                            <td colSpan="4" style={{"textAlign":"center"}}>No Package</td>
                          </tr>
                )}
              </tbody>
            </Table>
          </Box>

          <Box>&nbsp;</Box>
          <Box mt={40}>
            <Heading as={"h3"}>Create Package</Heading>
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
                  <Field label="FactoryName"  width={1}>
                    <Input
                      type="text"
                      required // set required attribute to use brower's HTML5 input validation
                      onChange={this.onNewFactoryNameChange}
                      value={newFactoryName}
                      width={1}
                    />
                  </Field>
                </Box>
                <Box width={[1, 1, 1]} px={3}>
                  <Field label="Location"  width={1}>
                    <Input
                      type="text"
                      required // set required attribute to use brower's HTML5 input validation
                      onChange={this.onNewLocationChange}
                      value={newLocation}
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
                        UserListData && UserListData.manufacturers.map((one_user, index)=>{
                          return (
                            <Radio key={index.toString()} label={one_user.name+"("+one_user.ethAddress+")"}
                              onChange={this.onNewManufacturerChange.bind(this, one_user.ethAddress)}
                              />  
                          )
                        })
                      }
                    </Box>
                  </Field>
                </Box>
              </Flex>
              <Box>
                <Button type="submit" onClick={this.onNewPackageSubmit}>
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
    let manufacturers = []
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
        }
    }

    console.log("---before setState -----")
    this.setState({ UserListData: { userCount, users, manufacturers } });
  }

  async _initialize() {
    console.log("enter initialize");

    await this._intializeEthers();

    try {
      await this._SupplyChain.deployed();

      let Owner = await this._SupplyChain.Owner();
      this.setState({Owner})

      console.log("Owner addr=", Owner);

      this._startPollingData();

      this._getPackageListData();

      this._getUserListData();
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
    this._pollDataInterval = setInterval(() => this._getPackageListData(), 10000);

    this._getPackageListData();
  }

  _stopPollingData() {
    clearInterval(this._pollDataInterval);
    this._pollDataInterval = undefined;
  }

  async _getPackageListData() {
    let packageCount = await this._SupplyChain.getPackagesCountS();

    console.log("--- userCount:")
    console.log(packageCount.toNumber())

    packageCount = packageCount.toNumber();

    let packages = []
    for(let i=0; i<packageCount; i++) {
        const packageId = await this._SupplyChain.getPackageIdByIndexS(i);

        console.log(packageId)
        packages.push({packageId})
    }

    console.log("---before setState -----")
    this.setState({ PackageListData: { packageCount, packages } });
  }

  async _createPackage(newPackage) {
    try {
      this._dismissTransactionError();

      let newDescription = newPackage.newDescription;
      newDescription = ethers.utils.formatBytes32String(newDescription);

      let newFactoryName = newPackage.newFactoryName;
      newFactoryName = ethers.utils.formatBytes32String(newFactoryName);

      let newLocation = newPackage.newLocation;
      newLocation = ethers.utils.formatBytes32String(newLocation);

      let newQuantity = newPackage.newQuantity;
      let newManufacturer = newPackage.newManufacturer;
  
      const tx = await this._SupplyChain.createRawPackage(
        newDescription, newFactoryName, newLocation, newQuantity, newManufacturer);

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
