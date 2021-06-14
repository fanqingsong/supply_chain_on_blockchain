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

export class UserList extends React.Component {
  constructor(props) {
    super(props);

    this.initialState = {
      contractOwner: undefined,

      // for display all users
      UserListData: undefined,

      // for creating new user
      newUserName: undefined,
      newUserLocation: undefined,
      // 0x84fae3d3cba24a97817b2a18c2421d462dbbce9f
      newUserEtherAddress: undefined,
      newUserRole: 2,

      txBeingSent: undefined,
      transactionError: undefined,
      networkError: undefined,
    };

    this.state = this.initialState;

    this.onNewUserNameChange = this.onNewUserNameChange.bind(this);
    this.onNewUserLocationChange = this.onNewUserLocationChange.bind(this);
    this.onNewUserEtherAddressChange = this.onNewUserEtherAddressChange.bind(this);
    this.onNewUserRoleChange = this.onNewUserRoleChange.bind(this);
    
    this.onNewUserSubmit = this.onNewUserSubmit.bind(this);
    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.onUserDisabledToggle = this.onUserDisabledToggle.bind(this);
  }

  onNewUserNameChange(e) {
    let newUserName = e.target.value;

    this.setState({"newUserName": newUserName})
  }

  onNewUserLocationChange(e) {
    let newUserLocation = e.target.value;

    this.setState({"newUserLocation": newUserLocation})
  }

  onNewUserEtherAddressChange(e) {
    let newUserEtherAddress = e.target.value;

    this.setState({"newUserEtherAddress": newUserEtherAddress})
  }

  onNewUserRoleChange(role) {
    console.log("user change role to", role)
    let newUserRole = role;

    this.setState({"newUserRole": newUserRole})
  }

  async onNewUserSubmit(e) {
    let newUserName = this.state.newUserName;
    let newUserLocation = this.state.newUserLocation;
    let newUserEtherAddress = this.state.newUserEtherAddress;
    let newUserRole = this.state.newUserRole;

    let newUser = {
      newUserName,
      newUserLocation,
      newUserEtherAddress,
      newUserRole
    }

    console.log("===============")
    console.log(newUser)

    await this._createUser(newUser);

    // this.setState({'newUserName':""})
    // this.setState({'newUserLocation':""})
    // this.setState({'newUserEtherAddress':""})
    // this.setState({'newUserRole':1})

    this._getUserListData();
  }

  async onUserDisabledToggle(id) {
    console.log("======enter onUserDisabledToggle id=", id);

    await this._toggleUserDisabled(id);

    this._getUserListData();
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
    let UserListData = this.state.UserListData;
    console.log("--------------")
    console.log(UserListData);

    let newUserName = this.state.newUserName || "";
    let newUserLocation = this.state.newUserLocation || "";
    let newUserEtherAddress = this.state.newUserEtherAddress || "";
    let newUserRole = this.state.newUserRole;

    return (
      <Box width={1}>
        <Box p={4} bg="Azure">
          <Box>
            <Heading as={"h3"}>User List</Heading>
            <Table width={1}>
              <thead>
                <tr>
                  <th width={0.2}>Name</th>
                  <th width={0.2}>Location</th>
                  <th width={0.4}>EtherAddress</th>
                  <th width={0.2}>Role</th>
                  <th width={0.2}>Action</th>
                </tr>
              </thead>
              <tbody>
                { UserListData && 
                        UserListData.users.map((oneUser, index) =>
                            <tr key={index.toString()}>
                              <td><Text width={"60px"} style={{overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}} title={oneUser.name}>{oneUser.name}</Text></td>
                              <td><Text width={"90px"} style={{overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}} title={oneUser.location}>{oneUser.location}</Text></td>
                              <td><Text width={"200px"} style={{overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}} title={oneUser.ethAddress}>{oneUser.ethAddress}</Text></td>
                              <td>
                                <Text width={"60px"} style={{overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}} title={this.translateRole(oneUser.role)}>
                                  {this.translateRole(oneUser.role)}
                                </Text></td>
                                <td>
                                  <Button size="small" mr={3} disabled={oneUser.role===1} onClick={this.onUserDisabledToggle.bind(this, oneUser.ethAddress)}>
                                    {oneUser.disabled===true?"Enable":"Disable"}
                                  </Button>
                                </td>
                            </tr>
                          )
                    }

                { UserListData && UserListData.userCount>0 || (
                          <tr>
                            <td colSpan="5" style={{"textAlign":"center"}}>No User</td>
                          </tr>
                )}
              </tbody>
            </Table>
          </Box>

          <Box>&nbsp;</Box>
          <Box mt={40}>
            <Heading as={"h3"}>Create User</Heading>
            <Form onSubmit={this.onFormSubmit}>
              <Flex mx={-3} flexWrap={"wrap"}>
                <Box width={[1, 1, 1]} px={3}>
                  <Field label="Name"  width={1}>
                    <Input
                      type="text"
                      required // set required attribute to use brower's HTML5 input validation
                      onChange={this.onNewUserNameChange}
                      value={newUserName}
                      width={1}
                    />
                  </Field>
                </Box>
                <Box width={[1, 1, 1]} px={3}>
                  <Field label="Location"  width={1}>
                    <Input
                      type="text"
                      required // set required attribute to use brower's HTML5 input validation
                      onChange={this.onNewUserLocationChange}
                      value={newUserLocation}
                      width={1}
                    />
                  </Field>
                </Box>
                <Box width={[1, 1, 1]} px={3}>
                  <Field label="EtherAddress"  width={1}>
                    <Input
                      type="text"
                      required // set required attribute to use brower's HTML5 input validation
                      onChange={this.onNewUserEtherAddressChange}
                      value={newUserEtherAddress}
                      width={1}
                    />
                  </Field>
                </Box>
                <Box width={[1, 1, 1]} px={3}>
                  <Field label="Role" width={1}>
                    <Box required={true}>
                      <Radio label="Supplier"
                        onChange={this.onNewUserRoleChange.bind(this, 2)}
                        checked={newUserRole===2?true:false}
                        />
                      <Radio label="Manufacturer" 
                        onChange={this.onNewUserRoleChange.bind(this, 3)}
                        checked={newUserRole===3?true:false}
                        />
                    </Box>
                  </Field>
                </Box>
              </Flex>
              <Box>
                <Button type="submit" onClick={this.onNewUserSubmit}>
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

  async _initialize() {
    console.log("enter initialize");

    await this._intializeEthers();

    try {
      await this._SupplyChain.deployed();

      let Owner = await this._SupplyChain.Owner();
      this.setState({Owner})

      console.log("Owner addr=", Owner);

      this._startPollingData();

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
    this._pollDataInterval = setInterval(() => this._getUserListData(), 10000);

    this._getUserListData();
  }

  _stopPollingData() {
    clearInterval(this._pollDataInterval);
    
    this._pollDataInterval = undefined;
  }

  async _getUserListData() {
    let userCount = await this._SupplyChain.getUsersCount();

    console.log("--- userCount:")
    console.log(userCount.toNumber())

    userCount = userCount.toNumber();

    let users = []
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
    }

    console.log("---before setState -----")
    this.setState({ UserListData: { userCount, users } });
  }

  async _createUser(newUser) {
    try {
      this._dismissTransactionError();

      let name = newUser.newUserName
      let etherAddress = newUser.newUserEtherAddress
      let location = newUser.newUserLocation
      let role = newUser.newUserRole

      const tx = await this._SupplyChain.registerUser(etherAddress, name, location, role);

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

  async _toggleUserDisabled(id) {
    try {
      this._dismissTransactionError();

      const tx = await this._SupplyChain.toggleUserDisabled(id);

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
