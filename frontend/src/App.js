import React from "react";

import { ethers } from "ethers";

import SupplyChainArtifact from "./contracts/SupplyChain.json";
import contractAddress from "./contracts/contract-address.json";

// All the logic of this dapp is contained in the Dapp component.
// These other components are just presentational ones: they don't have any
// logic. They just render HTML.
import { NoWalletDetected } from "./components/NoWalletDetected";

import Menus from "./Menus"
import Routes from "./Routes";

import {
  Box,
  Flex,
  Image,
  Card,
  Heading,
  Link,
  Form,
  Input,
  Select,
  Field,
  Button,
  Text,
  Checkbox,
  Radio
} from "rimble-ui";


import blockchainImage from "./asset/Blockchain-Icon.png"

import { Link as Router_Link } from "react-router-dom";

export class Dapp extends React.Component {
  constructor(props) {
    super(props);

    // We store multiple things in Dapp's state.
    // You don't need to follow this pattern, but it's an useful example.
    this.initialState = {
      // The user's address
      selectedAddress: undefined,

      contractOwner: undefined,

      userInfo: undefined,
    };

    this.state = this.initialState;
  }

  async _getUserInfo() {
    console.log("enter initialize");

    await this._intializeEthers();

    try {
      await this._SupplyChain.deployed();

      let Owner = await this._SupplyChain.Owner();
      this.setState({"contractOwner":Owner})

      console.log("Owner addr=", Owner);

      let userAddress = this.state.selectedAddress;
      console.log("================= before")
      let userInfo = await this._SupplyChain.getUserInfo(userAddress);
      this.setState({userInfo})

      console.log("================= after")
      console.log(userInfo)
      console.log(userInfo.role)
    } catch (error) {
      console.log(error)
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

  render() {
    // Ethereum wallets inject the window.ethereum object. If it hasn't been
    // injected, we instruct the user to install MetaMask.
    if (window.ethereum === undefined) {
      return <NoWalletDetected />;
    }

    let userInfo = this.state.userInfo;
    console.log("userInfo =", userInfo)
    let userRole = userInfo? userInfo.role: 0;
    console.log("user role =", userRole)

    // If everything is loaded, we render the application.
    return (
      <Box p={4}>
        <Flex justifyContent='center'>
          <Box width={0.2}>
            <Router_Link to="/tracker">
              <Image
                    alt="random unsplash image"
                    borderRadius={32}
                    height="200px"
                    src={blockchainImage}
                  />
            </Router_Link>
          </Box>

          <Box width={0.8} >
            <Card width={"auto"} mx={"auto"} px={[3, 3, 4]}>
              <Heading color={"Blue"}>SupplyChain on BlockChain</Heading>

              <Box>
                <Text mb={4}>
                  Welcome to Supply Chain System, Powered by ehtereum(BlockChain Technology).
                </Text>
              </Box>
            </Card>
          </Box>
        </Flex>

        <Flex>
          <Box width={0.2}>
            <Menus userRole={userRole} />
          </Box>
          <Box width={0.8}>
            <Card>
              <Routes />
            </Card>
          </Box>
        </Flex>        
      </Box>
    );
  }

  componentDidMount() {
    if (window.ethereum) {

      // The next thing we need to do, is try to connect their wallet.
      // When the wallet gets connected, we are going to save the users's address
      // in the component's state. 
      if (!this.state.selectedAddress) {
        this._connectWallet();

        this._getUserInfo();
      }
    }
  }

  componentWillUnmount() {
  }

  async _connectWallet() {
    // This method is run when the user clicks the Connect. It connects the
    // dapp to the user's wallet, and initializes it.

    // To connect to the user's wallet, we have to run this method.
    // It returns a promise that will resolve to the user's address.
    const [selectedAddress] = await window.ethereum.enable();

    // Once we have the address, we can initialize the application.
    this._initialize(selectedAddress);

    // We reinitialize it whenever the user changes their account.
    window.ethereum.on("accountsChanged", ([newAddress]) => {
      // `accountsChanged` event can be triggered with an undefined newAddress.
      // This happens when the user removes the Dapp from the "Connected
      // list of sites allowed access to your addresses" (Metamask > Settings > Connections)
      // To avoid errors, we reset the dapp state 
      if (newAddress === undefined) {
        return this._resetState();
      }
      
      this._initialize(newAddress);
      this._getUserInfo();
    });
    
    // We reset the dapp state if the network is changed
    window.ethereum.on("networkChanged", ([networkId]) => {
      this._resetState();
    });
  }

  async _initialize(userAddress) {
    // This method initializes the dapp
    // We first store the user's address in the component's state
    this.setState({
      selectedAddress: userAddress,
    });
  }

  // This method resets the state
  _resetState() {
    this.setState(this.initialState);
  }
}
