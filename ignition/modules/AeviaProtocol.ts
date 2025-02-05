import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { privateKeyToAccount } from "viem/accounts";
import { getAddress } from "viem";

export default buildModule("AeviaProtocol", (m) => {

    const operatorPrivateKey = process.env.OPERATOR_PRIVATE_KEY;
    if (!operatorPrivateKey) {
        throw new Error("Please set OPERATOR_PRIVATE_KEY in your environment");
    }
    const operatorAccount = privateKeyToAccount(`0x${operatorPrivateKey}` as `0x${string}`);
    const operatorAddress = getAddress(operatorAccount.address);

    const aeviaProtocol = m.contract("AeviaProtocol");
    m.call(aeviaProtocol, "addOperator", [operatorAddress]);

    return { aeviaProtocol };
}); 