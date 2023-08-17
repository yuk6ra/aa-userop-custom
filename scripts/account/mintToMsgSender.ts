import { ethers } from "ethers";
import { Client, Presets } from "userop";
import { CLIOpts } from "../../src/types";
// @ts-ignore
import config from "../../config.json";
import { ERC721_ABI } from "../../ABI/BaseToken";

export default async function main(
    c: string,
    s: number,
    opts: CLIOpts
) {
    const paymasterMiddleware = opts.withPM
        ? Presets.Middleware.verifyingPaymaster(
            config.paymaster.rpcUrl,
            config.paymaster.context
        )
        : undefined;

    const simpleAccount = await Presets.Builder.SimpleAccount.init(
        new ethers.Wallet(config.signingKey),
        config.rpcUrl,
        {
            paymasterMiddleware,
            overrideBundlerRpc: opts.overrideBundlerRpc,
            entryPoint: config.entryPoint,
            factory: config.simpleAccountFactory,
            salt: s
        }
    );

    const client = await Client.init(config.rpcUrl, {
        overrideBundlerRpc: opts.overrideBundlerRpc,
    });

    const contractAddress = ethers.utils.getAddress(c);

    const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);

    const contract = new ethers.Contract(contractAddress, ERC721_ABI, provider);

    const res = await client.sendUserOperation(

        simpleAccount.execute(
            contract.address,
            0,
            contract.interface.encodeFunctionData("mint1")
        ),
        {
            dryRun: opts.dryRun,
            onBuild: (op) => console.log("Signed UserOperation:", op),
        }
    );
    console.log(`UserOpHash: ${res.userOpHash}`);

    console.log("Waiting for transaction...");
    const ev = await res.wait();
    console.log(`Transaction hash: ${ev?.transactionHash ?? null}`);
}
