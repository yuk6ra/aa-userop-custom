#!/usr/bin/env node
import { Command } from "commander";
import MintToMsgSender from "./mintToMsgSender"

const program = new Command();

program
    .command("MintToMsgSender")
    .description("Mint to msg.sender")
    .requiredOption("-c, --contract <address>", "minter contract address")
    .requiredOption("-s, --salt <number>", "salt")
    .action(async (opts) =>
        MintToMsgSender(opts.contract, opts.salt, {
            dryRun: Boolean(opts.dryRun),
            withPM: Boolean(opts.withPaymaster),
        })
);

program.parse();
