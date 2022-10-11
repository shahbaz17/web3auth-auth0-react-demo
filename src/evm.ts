import type { SafeEventEmitterProvider } from '@web3auth/base';
import Web3 from 'web3';

export default class EthereumRpc {
	private provider: SafeEventEmitterProvider;

	constructor(provider: SafeEventEmitterProvider) {
		this.provider = provider;
	}

	async getChainId(): Promise<string> {
		try {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const web3 = new Web3(this.provider as any);

			// Get the connected Chain's ID
			const chainId = await web3.eth.getChainId();

			return chainId.toString();
		} catch (error) {
			return error as string;
		}
	}

	async getAccounts(): Promise<string[]> {
		try {
			const web3 = new Web3(this.provider as any);
			const accounts = await web3.eth.getAccounts();
			return accounts;
		} catch (error: unknown) {
			return error as string[];
		}
	}

	async getBalance(): Promise<string> {
		try {
			const web3 = new Web3(this.provider as any);
			const accounts = await web3.eth.getAccounts();
			const balance = await web3.eth.getBalance(accounts[0]);
			return balance;
		} catch (error) {
			return error as string;
		}
	}

	async signMessage() {
		try {
			const web3 = new Web3(this.provider as any);

			// Get user's Ethereum public address
			const account = (await web3.eth.getAccounts())[0];

			// Message
			const message = 'Hello MPC, bye bye seedphrase';

			const typedMessage = [
				{
					type: 'string',
					name: 'message',
					value: message,
				},
			];
			const params = [JSON.stringify(typedMessage), account];
			const method = 'eth_signTypedData';
			const signedMessage = await this.provider.request({
				method,
				params,
			});

			return signedMessage as string;
		} catch (error) {
			return error as string;
		}
	}

	async signTransaction(): Promise<any> {
		try {
			const web3 = new Web3(this.provider as any);

			const fromAddress = (await web3.eth.getAccounts())[0];

			const destination = fromAddress;

			const amount = web3.utils.toWei('0.00001'); // Convert 1 ether to wei

			// Submit transaction to the blockchain and wait for it to be mined
			const receipt = await web3.eth.signTransaction({
				from: fromAddress,
				to: destination,
				value: amount,
				maxPriorityFeePerGas: '5000000000', // Max priority fee per gas
				maxFeePerGas: '6000000000000', // Max fee per gas
			});

			return receipt;
		} catch (error) {
			return error as string;
		}
	}

	async sendTransaction(): Promise<any> {
		try {
			const web3 = new Web3(this.provider as any);

			// Get user's Ethereum public address
			const fromAddress = (await web3.eth.getAccounts())[0];
			const destination = fromAddress;

			const amount = web3.utils.toWei('0.001'); // Convert 1 ether to wei

			// Submit transaction to the blockchain and wait for it to be mined
			const receipt = await web3.eth.sendTransaction({
				from: fromAddress,
				to: destination,
				value: amount,
				chainId: 5,
			});

			return receipt;
		} catch (error) {
			return error as string;
		}
	}
}
