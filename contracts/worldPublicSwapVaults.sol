// SPDX-License-Identifier: Business Source License 1.1
// First Release Time : 2025.05.18

// Save all assets and enter and exit assets by calling the core's algorithm swap 
// or increasing||decreasing lp through lpmanager;
// All information of the currency pairs is also saved in this contract


pragma solidity 0.8.6;


/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves `amount` tokens from the caller's account to `recipient`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address recipient, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `sender` to `recipient` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

/**
 * @dev Collection of functions related to the address type
 */
library Address {
    /**
     * @dev Returns true if `account` is a contract.
     *
     * [IMPORTANT]
     * ====
     * It is unsafe to assume that an address for which this function returns
     * false is an externally-owned account (EOA) and not a contract.
     *
     * Among others, `isContract` will return false for the following
     * types of addresses:
     *
     *  - an externally-owned account
     *  - a contract in construction
     *  - an address where a contract will be created
     *  - an address where a contract lived, but was destroyed
     * ====
     */
    function isContract(address account) internal view returns (bool) {
        // This method relies on extcodesize, which returns 0 for contracts in
        // construction, since the code is only stored at the end of the
        // constructor execution.

        uint256 size;
        assembly {
            size := extcodesize(account)
        }
        return size > 0;
    }

    /**
     * @dev Replacement for Solidity's `transfer`: sends `amount` wei to
     * `recipient`, forwarding all available gas and reverting on errors.
     *
     * https://eips.ethereum.org/EIPS/eip-1884[EIP1884] increases the gas cost
     * of certain opcodes, possibly making contracts go over the 2300 gas limit
     * imposed by `transfer`, making them unable to receive funds via
     * `transfer`. {sendValue} removes this limitation.
     *
     * https://diligence.consensys.net/posts/2019/09/stop-using-soliditys-transfer-now/[Learn more].
     *
     * IMPORTANT: because control is transferred to `recipient`, care must be
     * taken to not create reentrancy vulnerabilities. Consider using
     * {ReentrancyGuard} or the
     * https://solidity.readthedocs.io/en/v0.5.11/security-considerations.html#use-the-checks-effects-interactions-pattern[checks-effects-interactions pattern].
     */
    function sendValue(address payable recipient, uint256 amount) internal {
        require(address(this).balance >= amount, "Address: insufficient balance");

        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Address: unable to send value, recipient may have reverted");
    }

    /**
     * @dev Performs a Solidity function call using a low level `call`. A
     * plain `call` is an unsafe replacement for a function call: use this
     * function instead.
     *
     * If `target` reverts with a revert reason, it is bubbled up by this
     * function (like regular Solidity function calls).
     *
     * Returns the raw returned data. To convert to the expected return value,
     * use https://solidity.readthedocs.io/en/latest/units-and-global-variables.html?highlight=abi.decode#abi-encoding-and-decoding-functions[`abi.decode`].
     *
     * Requirements:
     *
     * - `target` must be a contract.
     * - calling `target` with `data` must not revert.
     *
     * _Available since v3.1._
     */
    function functionCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionCall(target, data, "Address: low-level call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`], but with
     * `errorMessage` as a fallback revert reason when `target` reverts.
     *
     * _Available since v3.1._
     */
    function functionCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal returns (bytes memory) {
        return functionCallWithValue(target, data, 0, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but also transferring `value` wei to `target`.
     *
     * Requirements:
     *
     * - the calling contract must have an ETH balance of at least `value`.
     * - the called Solidity function must be `payable`.
     *
     * _Available since v3.1._
     */
    function functionCallWithValue(
        address target,
        bytes memory data,
        uint256 value
    ) internal returns (bytes memory) {
        return functionCallWithValue(target, data, value, "Address: low-level call with value failed");
    }

    /**
     * @dev Same as {xref-Address-functionCallWithValue-address-bytes-uint256-}[`functionCallWithValue`], but
     * with `errorMessage` as a fallback revert reason when `target` reverts.
     *
     * _Available since v3.1._
     */
    function functionCallWithValue(
        address target,
        bytes memory data,
        uint256 value,
        string memory errorMessage
    ) internal returns (bytes memory) {
        require(address(this).balance >= value, "Address: insufficient balance for call");
        require(isContract(target), "Address: call to non-contract");

        (bool success, bytes memory returndata) = target.call{value: value}(data);
        return _verifyCallResult(success, returndata, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a static call.
     *
     * _Available since v3.3._
     */
    function functionStaticCall(address target, bytes memory data) internal view returns (bytes memory) {
        return functionStaticCall(target, data, "Address: low-level static call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
     * but performing a static call.
     *
     * _Available since v3.3._
     */
    function functionStaticCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal view returns (bytes memory) {
        require(isContract(target), "Address: static call to non-contract");

        (bool success, bytes memory returndata) = target.staticcall(data);
        return _verifyCallResult(success, returndata, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a delegate call.
     *
     * _Available since v3.4._
     */
    function functionDelegateCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionDelegateCall(target, data, "Address: low-level delegate call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
     * but performing a delegate call.
     *
     * _Available since v3.4._
     */
    function functionDelegateCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal returns (bytes memory) {
        require(isContract(target), "Address: delegate call to non-contract");

        (bool success, bytes memory returndata) = target.delegatecall(data);
        return _verifyCallResult(success, returndata, errorMessage);
    }

    function _verifyCallResult(
        bool success,
        bytes memory returndata,
        string memory errorMessage
    ) private pure returns (bytes memory) {
        if (success) {
            return returndata;
        } else {
            // Look for revert reason and bubble it up if present
            if (returndata.length > 0) {
                // The easiest way to bubble the revert reason is using memory via assembly

                assembly {
                    let returndata_size := mload(returndata)
                    revert(add(32, returndata), returndata_size)
                }
            } else {
                revert(errorMessage);
            }
        }
    }
}


/**
 * @title SafeERC20
 * @dev Wrappers around ERC20 operations that throw on failure (when the token
 * contract returns false). Tokens that return no value (and instead revert or
 * throw on failure) are also supported, non-reverting calls are assumed to be
 * successful.
 * To use this library you can add a `using SafeERC20 for IERC20;` statement to your contract,
 * which allows you to call the safe operations as `token.safeTransfer(...)`, etc.
 */
library SafeERC20 {
    using Address for address;

    function safeTransfer(
        IERC20 token,
        address to,
        uint256 value
    ) internal {
        _callOptionalReturn(token, abi.encodeWithSelector(token.transfer.selector, to, value));
    }

    function safeTransferFrom(
        IERC20 token,
        address from,
        address to,
        uint256 value
    ) internal {
        _callOptionalReturn(token, abi.encodeWithSelector(token.transferFrom.selector, from, to, value));
    }

    /**
     * @dev Deprecated. This function has issues similar to the ones found in
     * {IERC20-approve}, and its usage is discouraged.
     *
     * Whenever possible, use {safeIncreaseAllowance} and
     * {safeDecreaseAllowance} instead.
     */
    function safeApprove(
        IERC20 token,
        address spender,
        uint256 value
    ) internal {
        // safeApprove should only be called when setting an initial allowance,
        // or when resetting it to zero. To increase and decrease it, use
        // 'safeIncreaseAllowance' and 'safeDecreaseAllowance'
        require(
            (value == 0) || (token.allowance(address(this), spender) == 0),
            "SafeERC20: approve from non-zero to non-zero allowance"
        );
        _callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, value));
    }

    function safeIncreaseAllowance(
        IERC20 token,
        address spender,
        uint256 value
    ) internal {
        uint256 newAllowance = token.allowance(address(this), spender) + value;
        _callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, newAllowance));
    }

    function safeDecreaseAllowance(
        IERC20 token,
        address spender,
        uint256 value
    ) internal {
        unchecked {
            uint256 oldAllowance = token.allowance(address(this), spender);
            require(oldAllowance >= value, "SafeERC20: decreased allowance below zero");
            uint256 newAllowance = oldAllowance - value;
            _callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, newAllowance));
        }
    }

    /**
     * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract), relaxing the requirement
     * on the return value: the return value is optional (but if data is returned, it must not be false).
     * @param token The token targeted by the call.
     * @param data The call data (encoded using abi.encode or one of its variants).
     */
    function _callOptionalReturn(IERC20 token, bytes memory data) private {
        // We need to perform a low level call here, to bypass Solidity's return data size checking mechanism, since
        // we're implementing it ourselves. We use {Address.functionCall} to perform this call, which verifies that
        // the target address contains contract code and also asserts for success in the low-level call.

        bytes memory returndata = address(token).functionCall(data, "SafeERC20: low-level call failed");
        if (returndata.length > 0) {
            // Return data is optional
            require(abi.decode(returndata, (bool)), "SafeERC20: ERC20 operation did not succeed");
        }
    }
}

library structlibrary {
    struct reserve{
        address[2]  assetAddr;
        uint[2]     reserve;           
        uint[2]     priceCumulative;
        uint        totalSupply;
        uint        a0;
        uint8       category; 
        uint32      balanceFee;
    }

    struct reserveInOrOut{       
        uint[2]     priceCumulative;
        uint[2]     reserve;
    }

    struct exVaults{
        address[] tokens;
        uint      amountIn;
        uint      amountOut;
        uint      Limits;
    }

}

interface iworldPublicSwapPair is IERC20{

    function mintXLp(address _account,uint256 _value) external ;
    function burnXLp(address _account,uint256 _value) external ;
    // --------------------- Info function ---------------------
    function sync() external;

}

interface iworldPublicFactory {

    function getPair(address tokenA, address tokenB) external view returns (address pair);
    function getCoinToStableLpPair(address tokenA) external view returns (address pair);
    function allLpPairs(uint) external view returns (address pair);
    function allLpPairsLength() external view returns (uint);
    function getLpPairsDetails(address pair) external view returns (address[2] memory,uint8);
    function createPair(address tokenA, address tokenB) external returns (address pair);

}


// World Public Swap


contract worldPublicSwapVaults{
    using SafeERC20 for IERC20;

    //----------------------Persistent Variables ----------------------
    uint public constant MINIMUM_LIQUIDITY = 10**3;
    
    address public slc;
    address public lpManager;
    address public factory;
    address public setter;
    address newsetter;
    mapping (address=>bool) public xInterface;

    mapping (address=>structlibrary.reserve) public reserves;
    mapping (address=>uint) public relativeTokenUpperLimit; // init is 1 ether

    mapping (address => mapping(address => address)) public getPair;
    mapping (address => address) public getCoinToStableLpPair;
    address[] public allPairsInVault;

    uint latestBlockNumber;

    uint public minLpLimit;      // Default settings 100 
    uint public mintListLimit;   // Default settings 1,000 

    //----------------------------modifier ----------------------------
    uint private unlocked = 1;
    modifier lock() {
        require(unlocked == 1, 'World Swap Vaults: LOCKED');
        unlocked = 0;
        _;
        unlocked = 1;
    }
    modifier onlyLpManager() {
        require(msg.sender == lpManager, 'World Swap Vaults: Only Lp Manager Use');
        _;
    }
    modifier onlyLpSetter() {
        require(msg.sender == setter, 'World Swap Vaults: Only Lp setter Use');
        _;
    }

    //-------------------------- constructor --------------------------
    constructor() {
        setter = msg.sender;
    }
    //----------------------------- event -----------------------------
    event SystemSetup(address _slc,address _lpManager,address _factory);
    event Interfacesetting(address _xInterface, bool _ToF);
    event TransferLpSetter(address _set);
    event AcceptLpSetter(bool _TorF);

    event Subscribe(address indexed lp, address subscribeAddress, uint lpAmount);
    event Redeem(address indexed lp, address redeemAddress, uint lpAmount);

    event CreatLpVault(address _lp,address[2] _tokens,uint8 lpCategory) ;
    event IncreaseLpAmount(address _lp,uint[2] _reserveIn,uint _lpAdd);
    event DereaseLpAmount(address _lp,uint[2] _reserveOut,uint _lpDel);
    event LpSettings(address _lp, uint32 _balanceFee, uint _a0) ;

    event worldPublicExchange(address indexed inputToken, address indexed outputToken,uint inputAmount,uint outputAmount);
    //----------------------------- ----- -----------------------------

    function systemSetup(address _slc,address _lpManager,address _factory) external onlyLpSetter{
            slc = _slc;
            lpManager = _lpManager;
            factory = _factory;
        emit SystemSetup(_slc, _lpManager, _factory);
    }

    function xInterfacesetting(address _xInterface, bool _ToF)external onlyLpSetter{
        xInterface[_xInterface] = _ToF;
        emit Interfacesetting( _xInterface, _ToF);
    }

    function transferLpSetter(address _set) external onlyLpSetter{
        newsetter = _set;
        emit TransferLpSetter(_set);
    }
    function acceptLpSetter(bool _TorF) external {
        require(msg.sender == newsetter, 'World Swap Vaults: Permission FORBIDDEN');
        if(_TorF){
            setter = newsetter;
        }
        newsetter = address(0);
        emit AcceptLpSetter(_TorF);
    }
    function exceptionTransfer(address recipient) external onlyLpSetter{
        require(address(this).balance>0,"World Swap Vaults: Insufficient amount");
        transferCFX(recipient,address(this).balance);
    }
    function transferCFX(address _recipient,uint256 _amount) private {
        require(address(this).balance>=_amount,"World Swap Vaults: Exceed the storage CFX balance");
        address payable receiver = payable(_recipient); // Set receiver
        (bool success, ) = receiver.call{value:_amount}("");
        require(success,"World Swap Vaults: CFX Transfer Failed");
    }
        //--------------------------- x Lp Subscribe & Redeem functions --------------------------

    function xLpSubscribe(address _lp,uint[2] memory _amountEstimated) external lock returns(uint[2] memory _amountActual,uint _amountLp){

        address[2] memory assetAddr;
        uint8 category;
        uint[2] memory reserve;           
        uint[2] memory priceCumulative;
        uint totalSupply;
        (assetAddr,category) = iworldPublicFactory(factory).getLpPairsDetails( _lp);
        (reserve,priceCumulative,totalSupply) = getLpReserve( _lp);

        require(assetAddr[0] != address(0),"World Swap LpManager: assetAddr can't be address(0) ");
        require(assetAddr[1] != address(0),"World Swap LpManager: assetAddr can't be address(0) ");

        if(reserve[0]==0){// First LP, will transfer to LpVault, can redeem when on other Lps; 

            require(reserve[1]==0,"World Swap LpManager: two reserve MUST be ZERO");//first Lp, need a 1000 xusd amount
            if(category==1){
                require(_amountEstimated[1] >= mintListLimit * 1 ether,"World Swap LpManager: First Lp need init SLC");
                require(_amountEstimated[0] >= 1000000,"World Swap LpManager: Cant Be a too small amount");
                _amountLp = _amountEstimated[1];
                _amountActual[0] = _amountEstimated[0];
                _amountActual[1] = _amountEstimated[1];
            }else if(category==2) {

                _amountActual[0] = _amountEstimated[0] * getLpPrice(iworldPublicFactory(factory).getCoinToStableLpPair(assetAddr[0]))/ 1 ether;

                _amountActual[1] = _amountEstimated[1] * getLpPrice(iworldPublicFactory(factory).getCoinToStableLpPair(assetAddr[1]))/ 1 ether;

                require(_amountActual[0] >= minLpLimit * 1 ether && _amountActual[1] >= minLpLimit * 1 ether,"World Swap LpManager: First Lp need init SLC Value");
                if(_amountActual[0]>=_amountActual[1]){
                    _amountLp = _amountActual[1];
                    _amountActual[0] = _amountActual[1] * 1 ether / getLpPrice(iworldPublicFactory(factory).getCoinToStableLpPair(assetAddr[0]));
                    _amountActual[1] = _amountEstimated[1];
                }else{
                    _amountLp = _amountActual[0];
                    _amountActual[1] = _amountActual[0] * 1 ether / getLpPrice(iworldPublicFactory(factory).getCoinToStableLpPair(assetAddr[1]));
                    _amountActual[0] = _amountEstimated[0];
                }
            }
            lpSettings(_lp, 30, 0);
            creatLpVault(_lp,assetAddr,category);//
        }else{// Subsequent LP addition, Lp will transfer to msg.sender; 
            _amountActual[0] = _amountEstimated[1]*reserve[0]/reserve[1];
            if(_amountActual[0]<=_amountEstimated[0]){
                _amountActual[1] = _amountEstimated[1];
            }else{
                _amountActual[0] = _amountEstimated[0];
                _amountActual[1] = _amountEstimated[0]*reserve[1]/reserve[0];
            }
            _amountLp = _amountActual[0] * totalSupply / reserve[0];
        }
        // here need add info change
        uint[2] memory totalTokenInVaults;
        totalTokenInVaults[0] = IERC20(assetAddr[0]).balanceOf(address(this));
        totalTokenInVaults[1] = IERC20(assetAddr[1]).balanceOf(address(this));
        

        IERC20(assetAddr[0]).safeTransferFrom(msg.sender,address(this),_amountActual[0]);
        IERC20(assetAddr[1]).safeTransferFrom(msg.sender,address(this),_amountActual[1]);

        require(_amountActual[0] == IERC20(assetAddr[0]).balanceOf(address(this)) - totalTokenInVaults[0],"World Swap LpManager: Cannot compatible with tokens with transaction fees");
        require(_amountActual[1] == IERC20(assetAddr[1]).balanceOf(address(this)) - totalTokenInVaults[1],"World Swap LpManager: Cannot compatible with tokens with transaction fees");

        increaseLpAmount(_lp, _amountActual,_amountLp);
        
        iworldPublicSwapPair(_lp).mintXLp(msg.sender, _amountLp);
        emit Subscribe(_lp, msg.sender, _amountLp);
        
    }

    function xLpRedeem(address _lp,uint _amountLp) external lock returns(uint[2] memory _amount){
        require(_lp != address(0),"World Swap LpManager: _lp can't be address(0) ");
        require(_amountLp > 0,"World Swap LpManager: _amountLp must > 0");
        address[2] memory assetAddr;
        uint8 category;
        uint[2] memory reserve;           
        uint totalSupply;
        (assetAddr,category) = iworldPublicFactory(factory).getLpPairsDetails( _lp);
        (reserve,,totalSupply) = getLpReserve( _lp);
        IERC20(_lp).safeTransferFrom(msg.sender,address(this),_amountLp);
        iworldPublicSwapPair(_lp).burnXLp(address(this), _amountLp);
        _amount[0] = reserve[0] * _amountLp /totalSupply;
        _amount[1] = reserve[1] * _amountLp /totalSupply;
        
        IERC20(assetAddr[0]).safeTransfer(msg.sender,_amount[0]);
        IERC20(assetAddr[1]).safeTransfer(msg.sender,_amount[1]);

        // here need add info change
        dereaseLpAmount(_lp, _amount,_amountLp);
        emit Redeem(_lp, msg.sender, _amountLp);
    }
    //----------------------------------------onlyLpManager Use Function------------------------------
    function creatLpVault(address _lp,address[2] memory _tokens,uint8 lpCategory) internal{
        require(reserves[_lp].assetAddr[0] == address(0),"World Swap Vaults: Already Have the Lp");

        reserves[_lp].assetAddr[0] = _tokens[0];
        reserves[_lp].assetAddr[1] = _tokens[1];
        reserves[_lp].category = lpCategory;
        IERC20(_tokens[0]).approve(lpManager, type(uint256).max);
        IERC20(_tokens[1]).approve(lpManager, type(uint256).max);
        allPairsInVault.push(_lp);
        getPair[_tokens[0]][_tokens[1]] = _lp;
        getPair[_tokens[1]][_tokens[0]] = _lp;
        if(lpCategory == 1){
            getCoinToStableLpPair[_tokens[0]]  = _lp;
        }
        emit CreatLpVault(_lp, _tokens, lpCategory);
    }

    function increaseLpAmount(address _lp,uint[2] memory _reserveIn,uint _lpAdd) internal{
        require(reserves[_lp].assetAddr[0] != address(0),"World Swap Vaults: Cant be Zero Tokens");
        address[2] memory reserveAddr = getLpPair( _lp) ;

        uint[2] memory totalTokenInVaults;
        totalTokenInVaults[0] = IERC20(reserveAddr[0]).balanceOf(address(this)) - _reserveIn[0];
        totalTokenInVaults[1] = IERC20(reserveAddr[1]).balanceOf(address(this)) - _reserveIn[1];

        if(reserves[_lp].reserve[0]==0 && reserves[_lp].reserve[1]==0){
            if(relativeTokenUpperLimit[reserveAddr[0]] == 0){
                reserves[_lp].reserve[0] = 1 ether;
                relativeTokenUpperLimit[reserveAddr[0]] = 1 ether;
            }else {
                reserves[_lp].reserve[0] += _reserveIn[0] * relativeTokenUpperLimit[reserveAddr[0]] / totalTokenInVaults[0];
                relativeTokenUpperLimit[reserveAddr[0]] += _reserveIn[0] * relativeTokenUpperLimit[reserveAddr[0]] / totalTokenInVaults[0];
            }
            if(relativeTokenUpperLimit[reserveAddr[1]] == 0){
                reserves[_lp].reserve[1] = 1 ether;
                relativeTokenUpperLimit[reserveAddr[1]] = 1 ether;
            }else{
                reserves[_lp].reserve[1] += _reserveIn[1] * relativeTokenUpperLimit[reserveAddr[1]] / totalTokenInVaults[1];
                relativeTokenUpperLimit[reserveAddr[1]] += _reserveIn[1] * relativeTokenUpperLimit[reserveAddr[1]] / totalTokenInVaults[1];
            }
            
            reserves[_lp].totalSupply = _lpAdd;
            reserves[_lp].priceCumulative[0] = _reserveIn[1];
            reserves[_lp].priceCumulative[1] = _reserveIn[0];

        }else{// this mode priceCumulative not change
            require(totalTokenInVaults[0]>0 && totalTokenInVaults[1]>0,"World Swap Vaults: total Token In Vaults Need > 0");
            reserves[_lp].reserve[0] += _reserveIn[0] * relativeTokenUpperLimit[reserveAddr[0]] / totalTokenInVaults[0];
            reserves[_lp].reserve[1] += _reserveIn[1] * relativeTokenUpperLimit[reserveAddr[1]] / totalTokenInVaults[1];
            relativeTokenUpperLimit[reserveAddr[0]] += _reserveIn[0] * relativeTokenUpperLimit[reserveAddr[0]] / totalTokenInVaults[0];
            relativeTokenUpperLimit[reserveAddr[1]] += _reserveIn[1] * relativeTokenUpperLimit[reserveAddr[1]] / totalTokenInVaults[1];
            reserves[_lp].totalSupply += _lpAdd;
        }
        emit IncreaseLpAmount(_lp,_reserveIn,_lpAdd);
    }
    function dereaseLpAmount(address _lp,uint[2] memory _reserveOut,uint _lpDel) internal{
        address[2] memory reserveAddr = getLpPair( _lp) ;
        uint[2] memory totalTokenInVaults;
        totalTokenInVaults[0] = IERC20(reserveAddr[0]).balanceOf(address(this)) + _reserveOut[0];//getLpTokenSum( _lp);//
        totalTokenInVaults[1] = IERC20(reserveAddr[1]).balanceOf(address(this)) + _reserveOut[1];
        require(totalTokenInVaults[0]>0&&totalTokenInVaults[1]>0,"World Swap Vaults: Vaults have NO reserve");
        reserves[_lp].reserve[0] -= _reserveOut[0] * relativeTokenUpperLimit[reserveAddr[0]]/totalTokenInVaults[0];
        reserves[_lp].reserve[1] -= _reserveOut[1] * relativeTokenUpperLimit[reserveAddr[1]]/totalTokenInVaults[1];
        relativeTokenUpperLimit[reserveAddr[0]] -= _reserveOut[0] * relativeTokenUpperLimit[reserveAddr[0]] / totalTokenInVaults[0];
        relativeTokenUpperLimit[reserveAddr[1]] -= _reserveOut[1] * relativeTokenUpperLimit[reserveAddr[1]] / totalTokenInVaults[1];
        reserves[_lp].totalSupply -= _lpDel;
        emit DereaseLpAmount(_lp, _reserveOut, _lpDel);
    }

    function lpSettings(address _lp, uint32 _balanceFee, uint _a0) public onlyLpManager{
        require(_balanceFee <= 500,"World Swap Vaults: balance fee cant > 5%");
        reserves[_lp].balanceFee =_balanceFee;
        reserves[_lp].a0 = _a0;
        emit LpSettings(_lp, _balanceFee, _a0) ;
    }
    function addTokenApproveToLpManager(address _token) public onlyLpManager{     
        IERC20(_token).approve(lpManager, type(uint256).max);
    }
    //----------------------------------------Parameters Function------------------------------

    function lengthOfPairsInVault() public view returns (uint) {
        return (allPairsInVault.length);
    }
    function getLpReserve(address _lp) public view returns (uint[2] memory ,uint[2] memory, uint ) {
        require(_lp!=address(0),"World Swap Vaults: cant be 0 address");
        address[2] memory reserveAddr = getLpPair( _lp) ;
        uint[2] memory TokenInVaults;
        if(reserveAddr[0]==address(0)){
            return (TokenInVaults, reserves[_lp].priceCumulative, reserves[_lp].totalSupply);
        }
        if(relativeTokenUpperLimit[reserveAddr[0]] == 0){
            TokenInVaults[0] = 0;
            TokenInVaults[1] = 0;
        }else{
            TokenInVaults[0] = reserves[_lp].reserve[0] * IERC20(reserveAddr[0]).balanceOf(address(this)) / relativeTokenUpperLimit[reserveAddr[0]];
            TokenInVaults[1] = reserves[_lp].reserve[1] * IERC20(reserveAddr[1]).balanceOf(address(this)) / relativeTokenUpperLimit[reserveAddr[1]];
        }
                
        return (TokenInVaults, reserves[_lp].priceCumulative, reserves[_lp].totalSupply);
    }

    function getLpTokenSum(address _lp) public view returns (uint[2] memory totalTokenInVaults){
        address[2] memory reserveAddr = getLpPair( _lp) ;
        totalTokenInVaults[0] = IERC20(reserveAddr[0]).balanceOf(address(this));
        totalTokenInVaults[1] = IERC20(reserveAddr[1]).balanceOf(address(this));
    }

    function getLpPrice(address _lp) public view returns (uint price){
        require(_lp!=address(0),"World Swap Vaults: cant be 0 address");

        (uint[2] memory reserve, , ) = getLpReserve(_lp);
        if(reserve[1] == 0){
            price = 1 ether;
        }else{
            price = reserve[1] * 1 ether / reserve[0];
        }
    }
    function getLpPair(address _lp) public view returns (address[2] memory){
        return reserves[_lp].assetAddr;
    }
    function getLpInputTokenSlot(address _lp,address _inputToken) public view returns (bool slot){
        if(_inputToken == reserves[_lp].assetAddr[0]){
            slot = true;
        }else{
            slot = false;
        }
    }
    function getLpSettings(address _lp) external view returns(uint32 balanceFee, uint a0){
        balanceFee = reserves[_lp].balanceFee;
        a0 = reserves[_lp].a0;
    }
    //----------------------------------------Exchange Function------------------------------
    function exchange(structlibrary.exVaults memory _exVaults,uint deadline) public lock returns(uint){
        require(_exVaults.tokens[0]!=_exVaults.tokens[1],"World Swap Vaults: can't swap same token");
        uint inputAmount;
        uint outputAmount;
        uint plusAmount;
        uint tempAmount;
        uint tempAmount0;
        uint tempAmount1;
        inputAmount = IERC20(_exVaults.tokens[0]).balanceOf(address(this));
        outputAmount = IERC20(_exVaults.tokens[1]).balanceOf(address(this));
        
        IERC20(_exVaults.tokens[0]).safeTransferFrom(msg.sender,address(this),_exVaults.amountIn);
        tempAmount = IERC20(_exVaults.tokens[0]).balanceOf(address(this)) - inputAmount;

        if(_exVaults.tokens[0] == slc){
            tempAmount0 = inputAmount;
        }else{
            tempAmount0 = inputAmount * getLpPrice(getCoinToStableLpPair[_exVaults.tokens[0]]) / 1 ether;
        }
        if(_exVaults.tokens[1] == slc){
            tempAmount1 = outputAmount;
        }else{
            tempAmount1 = outputAmount * getLpPrice(getCoinToStableLpPair[_exVaults.tokens[1]]) / 1 ether;
        }
        
        if(tempAmount0 > tempAmount1){
            inputAmount = inputAmount * tempAmount1 / tempAmount0;
        }else{
            outputAmount = outputAmount * tempAmount0 / tempAmount1;
        }

        plusAmount = inputAmount * outputAmount;

        outputAmount = (outputAmount - plusAmount / (tempAmount + inputAmount)) * 99 / 100;

        IERC20(_exVaults.tokens[1]).safeTransfer(msg.sender,outputAmount);
        tempAmount = IERC20(_exVaults.tokens[0]).balanceOf(address(this)) * IERC20(_exVaults.tokens[1]).balanceOf(address(this));

        require(tempAmount >= plusAmount,"World Swap Vaults: exceed plus Limits");
        
        return outputAmount;
    }

    function xexchange(address[] memory tokens,uint amountIn,uint amountOut,uint limits,uint deadline) external returns(uint){
        structlibrary.exVaults memory _exVaults;
        _exVaults.tokens = tokens;
        _exVaults.amountIn = amountIn;
        _exVaults.amountOut = amountOut;
        _exVaults.Limits = limits;
        return exchange(_exVaults,deadline);
    }

    function exchangeEstimate(address tokenInput, address tokenOutput, uint amountIn) public view returns(uint){
        require(tokenInput != tokenOutput,"World Swap Vaults: can't swap same token");
        uint inputAmount;
        uint outputAmount;
        uint plusAmount;
        // uint tempAmount;
        uint tempAmount0;
        uint tempAmount1;
        inputAmount = IERC20(tokenInput).balanceOf(address(this));
        outputAmount = IERC20(tokenOutput).balanceOf(address(this));
        
        // IERC20(tokenInput).safeTransferFrom(msg.sender,address(this),_exVaults.amountIn);
        // tempAmount = IERC20(_exVaults.tokens[0]).balanceOf(address(this)) - inputAmount;

        if(tokenInput == slc){
            tempAmount0 = inputAmount ;
        }else{
            tempAmount0 = inputAmount * getLpPrice(getCoinToStableLpPair[tokenInput]) / 1 ether;
        }
        if(tokenOutput == slc){
            tempAmount1 = outputAmount;
        }else{
            tempAmount1 = outputAmount * getLpPrice(getCoinToStableLpPair[tokenOutput]) / 1 ether;
        }
        
        if(tempAmount0 > tempAmount1){
            inputAmount = inputAmount * tempAmount1 / tempAmount0;
        }else{
            outputAmount = outputAmount * tempAmount0 / tempAmount1;
        }

        plusAmount = inputAmount * outputAmount;

        outputAmount = (outputAmount - plusAmount / (amountIn + inputAmount)) * 99 / 100;
        return outputAmount;
    }

    // ======================== contract base methods =====================
    
    fallback() external payable {}
    receive() external payable {}

}