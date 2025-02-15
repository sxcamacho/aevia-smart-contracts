import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("Boy", (m) => {
    const boy = m.contract("JustABoy");
    return { boy };
}); 