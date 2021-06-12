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
      UserListData: undefined,

      newDevice: undefined,

      txBeingSent: undefined,
      transactionError: undefined,
      networkError: undefined,
    };

    this.state = this.initialState;

    this.onNewDeviceChange = this.onNewDeviceChange.bind(this);
    this.onNewDeviceSubmit = this.onNewDeviceSubmit.bind(this);
    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.onDeviceToggle = this.onDeviceToggle.bind(this);
  }

  onNewDeviceChange(e) {
    let newDevice = e.target.value;

    this.setState({"newDevice": newDevice})
  }

  async onNewDeviceSubmit(e) {
    let newDevice = this.state.newDevice;

    await this._createDevice(newDevice);

    this.setState({'newDevice':""})

    this._getUserListData();
  }

  async onDeviceToggle(id) {
    console.log("==============================enter ondevice");

    let UserListData = this.state.UserListData;
    let devices = UserListData.devices;

    devices.forEach(oneDevice => {
      let _id = oneDevice.id;

      if (id === _id) {
        oneDevice.completed = !oneDevice.completed;
      }
    });

    this.setState({UserListData});

    await this._toggleDevice(id);

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
    } else if (role === 4) {
      return "revoked"
    }
  }

  render() {
    let UserListData = this.state.UserListData;
    console.log("--------------")
    console.log(UserListData);

    let newDevice = this.state.newDevice || "";

    return (
      <Box width={0.8} px={80} bg="Azure">
        <Box p={4}>
          <Table width={1}>
            <thead>
              <tr>
                <th width={0.2}>Name</th>
                <th width={0.2}>Location</th>
                <th width={0.4}>EtherAddress</th>
                <th width={0.2}>Role</th>
              </tr>
            </thead>
            <tbody>
              { UserListData && 
                      UserListData.users.map((oneUser, index) =>
                          <tr key={index.toString()}>
                            <td><Text width={"60px"} style={{overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}} title={oneUser.name}>{oneUser.name}</Text></td>
                            <td><Text width={"60px"} style={{overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}} title={oneUser.location}>{oneUser.location}</Text></td>
                            <td><Text width={"100px"} style={{overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}} title={oneUser.ethAddress}>{oneUser.ethAddress}</Text></td>
                            <td>
                              <Text width={"60px"} style={{overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}} title={this.translateRole(oneUser.role)}>
                                {this.translateRole(oneUser.role)}
                              </Text></td>
                          </tr>
                        )
                  }

              { UserListData && UserListData.userCount>0 || (
                        <tr>
                          <td colspan="4" style={{"textAlign":"center"}}>No User</td>
                        </tr>
              )}
            </tbody>
          </Table>

          <Box>
            <Form onSubmit={this.onFormSubmit}>
              <Flex mx={-3} flexWrap={"wrap"}>
                <Box width={[1, 1, 1]} px={3}>
                  <Field label="Device Name"  width={1}>
                    <Input
                      type="text"
                      required // set required attribute to use brower's HTML5 input validation
                      onChange={this.onNewDeviceChange}
                      value={newDevice}
                      width={1}
                    />
                  </Field>
                </Box>
              </Flex>
              <Box>
                <Button type="submit" onClick={this.onNewDeviceSubmit}>
                  Submit Form
                </Button>
              </Box>
            </Form>
            {/* <Box fontSize={4} p={3} width={[1, 1, 1]}>
                { UserListData && 
                    UserListData.devices.map((oneDevice) =>
                        <Checkbox key={oneDevice.id.toString()} label={oneDevice.deviceName} checked={oneDevice.completed} onChange={(e)=>this.onDeviceToggle(oneDevice.id)} />
                    )
                }
            </Box> */}
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
            id: i,
            name: user.name,
            location: user.location,
            ethAddress: user.ethAddress,
            role: user.role
        }

        users.push(one_user);
    }

    console.log("---before setState -----")
    this.setState({ UserListData: { userCount, users } });
  }

  async _createDevice(deviceName) {
    try {
      this._dismissTransactionError();

      const tx = await this._SupplyChain.createDevice(deviceName);

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

  async _toggleDevice(id) {
    try {
      this._dismissTransactionError();

      const tx = await this._SupplyChain.toggleCompleted(id);

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
