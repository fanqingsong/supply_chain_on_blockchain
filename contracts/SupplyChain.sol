pragma solidity >=0.4.25 <0.6.0;

import './RawMatrials.sol';
import './Madicine.sol';

/// @title Blockchain : Pharmaceutical SupplyChain
/// @author Kamal Kishor Mehra
contract SupplyChain {

    /// @notice
    address public Owner;

    /// @notice
    /// @dev Initiate SupplyChain Contract
    constructor () public {
        Owner = msg.sender;

        // add owner as the admin user
        registerUser(Owner, "Admin", "Nanking", uint(roles.admin));
    }

    /// @dev Validate Owner
    modifier onlyOwner() {
        require(
            msg.sender == Owner,
            "Only owner can call this function."
        );
        _;
    }

/********************************************** User Section **********************************************/
    enum roles {
        norole,
        admin,
        supplier,
        manufacturer
    }

    struct UserInfo {
        string name;
        string location;
        address ethAddress;
        roles role;
        bool disabled;
    }

    /// @notice
    mapping(address => UserInfo) UsersDetails;
    
    /// @notice
    address[] users;

    /// @notice
    /// @dev Get User Information/ Profile
    /// @param User User Ethereum Network Address
    /// @return User Details
    function getUserInfo(address User) public view returns(
        string memory name,
        string memory location,
        address ethAddress,
        roles role,
        bool disabled
        ) {
        return (
            UsersDetails[User].name,
            UsersDetails[User].location,
            UsersDetails[User].ethAddress,
            UsersDetails[User].role,
            UsersDetails[User].disabled);
    }

    /// @notice
    /// @dev Get Number of registered Users
    /// @return Number of registered Users
    function getUsersCount() public view returns(uint count){
        return users.length;
    }

    /// @notice
    /// @dev Get User by Index value of stored data
    /// @param index Indexed Number
    /// @return User Details
    function getUserbyIndex(uint index) public view returns(
        string memory name,
        string memory location,
        address ethAddress,
        roles role,
        bool disabled
        ) {
        return getUserInfo(users[index]);
    }

/********************************************** Owner Section *********************************************/
    event UserRegister(address indexed EthAddress, string Name);
    event UserDisabledToggle(address indexed EthAddress, string Name);

    /// @notice
    /// @dev Register New user by Owner
    /// @param EthAddress Ethereum Network Address of User
    /// @param Name User name
    /// @param Location User Location
    /// @param Role User Role
    function registerUser(
        address EthAddress,
        string memory Name,
        string memory Location,
        uint Role
        ) public
        onlyOwner
    {
        require(UsersDetails[EthAddress].role == roles.norole, "User Already registered");

        UsersDetails[EthAddress].name = Name;
        UsersDetails[EthAddress].location = Location;
        UsersDetails[EthAddress].ethAddress = EthAddress;
        UsersDetails[EthAddress].role = roles(Role);
        UsersDetails[EthAddress].disabled = false;

        users.push(EthAddress);

        emit UserRegister(EthAddress, Name);
    }

    /// @notice
    /// @dev disable users role
    /// @param userAddress User Ethereum Network Address
    function toggleUserDisabled(address userAddress) public onlyOwner {
        require(UsersDetails[userAddress].role != roles.norole, "User not registered");

        UsersDetails[userAddress].disabled = !UsersDetails[userAddress].disabled;

        emit UserDisabledToggle(userAddress, UsersDetails[userAddress].name);
    }

/********************************************** Supplier Section ******************************************/
    /// @notice
    mapping(address => address[]) supplierRawProductInfo;

    event RawSupplyInit(
        address indexed ProductID,
        address indexed Supplier,
        address Shipper,
        address indexed Receiver
    );

    /// @notice
    /// @dev Create new raw package by Supplier
    /// @param Des Transporter Ethereum Network Address
    /// @param Rcvr Manufacturer Ethereum Network Address
    function createRawPackage(
        bytes32 Des,
        bytes32 FN,
        bytes32 Loc,
        uint Quant,
        address Shpr,
        address Rcvr
        ) public {
        require(
            UsersDetails[msg.sender].role == roles.supplier,
            "Only Supplier Can call this function "
        );

        RawMatrials rawData = new RawMatrials(
            msg.sender,
            Des,
            FN,
            Loc,
            Quant,
            Shpr,
            Rcvr
            );

        supplierRawProductInfo[msg.sender].push(address(rawData));

        emit RawSupplyInit(address(rawData), msg.sender, Shpr, Rcvr);
    }

    /// @notice
    /// @dev  Get Count of created package by supplier(caller)
    /// @return Number of packages
    function getPackagesCountS() public view returns (uint count){
        require(
            UsersDetails[msg.sender].role == roles.supplier,
            "Only Supplier Can call this function "
        );
        return supplierRawProductInfo[msg.sender].length;
    }

    /// @notice
    /// @dev Get PackageID by Indexed value of stored data
    /// @param index Indexed Value
    /// @return PackageID
    function getPackageIdByIndexS(uint index) public view returns(address packageID) {
        require(
            UsersDetails[msg.sender].role == roles.supplier,
            "Only Supplier Can call this function "
        );
        return supplierRawProductInfo[msg.sender][index];
    }

/********************************************** Manufacturer Section ******************************************/
    /// @notice
    mapping(address => address[]) RawPackagesAtManufacturer;

    /// @notice
    /// @dev Update Package / Madicine batch recieved status by ethier Manufacturer or Distributer
    /// @param pid  PackageID or MadicineID
    function  rawPackageReceived(
        address pid
    ) public {
        require(
            UsersDetails[msg.sender].role == roles.manufacturer,
            "Only manufacturer can call this function"
        );

        RawMatrials(pid).receivedPackage(msg.sender);
        RawPackagesAtManufacturer[msg.sender].push(pid);
    }

    /// @notice
    /// @dev Get Package Count at Manufacturer
    /// @return Number of Packages at Manufacturer
    function getPackagesCountM() public view returns(uint count){
        require(
            UsersDetails[msg.sender].role == roles.manufacturer,
            "Only manufacturer can call this function"
        );
        return RawPackagesAtManufacturer[msg.sender].length;
    }

    /// @notice
    /// @dev Get PackageID by Indexed value of stored data
    /// @param index Indexed Value
    /// @return PackageID
    function getPackageIDByIndexM(uint index) public view returns(address BatchID){
        require(
            UsersDetails[msg.sender].role == roles.manufacturer,
            "Only manufacturer can call this function"
        );
        return RawPackagesAtManufacturer[msg.sender][index];
    }

    /// @notice
    mapping(address => address[]) ManufactureredMadicineBatches;
    event MadicineNewBatch(
        address indexed BatchId,
        address indexed Manufacturer,
        address shipper,
        address indexed Receiver
    );

    /// @notice
    /// @dev Create Madicine Batch
    /// @param Des Description of madicine batch
    /// @param RM RawMatrials Information
    /// @param Quant Number of Units
    /// @param Shpr Transporter Ethereum Network Address
    /// @param Rcvr Receiver Ethereum Network Address
    /// @param RcvrType Receiver Type Ethier Wholesaler(1) or Distributer(2)
    function manufacturMadicine(
        bytes32 Des,
        bytes32 RM,
        uint Quant,
        address Shpr,
        address Rcvr,
        uint RcvrType
    ) public {
        require(
            UsersDetails[msg.sender].role == roles.manufacturer,
            "Only manufacturer can call this function"
        );
        require(
            RcvrType != 0,
            "Receiver Type must be define"
        );

        Madicine m = new Madicine(
            msg.sender,
            Des,
            RM,
            Quant,
            Shpr,
            Rcvr,
            RcvrType
        );

        ManufactureredMadicineBatches[msg.sender].push(address(m));
        emit MadicineNewBatch(address(m), msg.sender, Shpr, Rcvr);
    }

    /// @notice
    /// @dev Get Madicine Batch Count
    /// @return Number of Batches
    function getBatchesCountM() public view returns (uint count){
        require(
            UsersDetails[msg.sender].role == roles.manufacturer,
            "Only Manufacturer Can call this function."
        );
        return ManufactureredMadicineBatches[msg.sender].length;
    }

    /// @notice
    /// @dev Get Madicine BatchID by indexed value of stored data
    /// @param index Indexed Number
    /// @return Madicine BatchID
    function getBatchIdByIndexM(uint index) public view returns(address packageID) {
        require(
            UsersDetails[msg.sender].role == roles.manufacturer,
            "Only Manufacturer Can call this function."
        );

        return ManufactureredMadicineBatches[msg.sender][index];
    }
}
