import { useEffect, useState } from 'react';
import { Web3AuthCore } from '@web3auth/core';
import {
	WALLET_ADAPTERS,
	CHAIN_NAMESPACES,
	SafeEventEmitterProvider,
} from '@web3auth/base';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';
import RPC from './evm';
import './App.css';

const clientId =
	'BBP_6GOu3EJGGws9yd8wY_xFT0jZIWmiLMpqrEMx36jlM61K9XRnNLnnvEtGpF-RhXJDGMJjL-I-wTi13RcBBOo'; // get from https://dashboard.web3auth.io

function App() {
	const [web3auth, setWeb3auth] = useState<Web3AuthCore | null>(null);
	const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(
		null,
	);

	useEffect(() => {
		const init = async () => {
			try {
				const web3auth = new Web3AuthCore({
					chainConfig: {
						chainNamespace: CHAIN_NAMESPACES.EIP155,
						chainId: '0x1',
					},
				});

				const openloginAdapter = new OpenloginAdapter({
					adapterSettings: {
						clientId,
						network: 'testnet',
						uxMode: 'popup',
						loginConfig: {
							jwt: {
								name: 'Web3Auth-Auth0-JWT',
								verifier: 'web3auth-auth0-alam',
								typeOfLogin: 'jwt',
								clientId: '294QRkchfq2YaXUbPri7D6PH7xzHgQMT',
							},
						},
					},
				});
				web3auth.configureAdapter(openloginAdapter);
				await web3auth.init();
				setWeb3auth(web3auth);

				if (web3auth.provider) {
					setProvider(web3auth.provider);
				}
			} catch (error) {
				console.error(error);
			}
		};

		init();
	}, []);

	const login = async () => {
		if (!web3auth) {
			uiConsole('web3auth not initialized yet');
			return;
		}
		const web3authProvider = await web3auth.connectTo(
			WALLET_ADAPTERS.OPENLOGIN,
			{
				relogin: true,
				loginProvider: 'jwt',
				extraLoginOptions: {
					domain: 'https://shahbaz-torus.us.auth0.com',
					verifierIdField: 'sub',
				},
			},
		);
		setProvider(web3authProvider);
	};

	const authenticateUser = async () => {
		if (!web3auth) {
			uiConsole('web3auth not initialized yet');
			return;
		}
		const idToken = await web3auth.authenticateUser();
		uiConsole(idToken);
	};

	const parseToken = async () => {
		const idToken = await web3auth?.authenticateUser();
		console.log(idToken?.idToken);
		const base64Url = idToken?.idToken.split('.')[1];
		const base64 = base64Url?.replace('-', '+').replace('_', '/');
		const result = JSON.parse(window.atob(base64 || ''));
		uiConsole(result);
	};

	const getUserInfo = async () => {
		if (!web3auth) {
			uiConsole('web3auth not initialized yet');
			return;
		}
		const user = await web3auth.getUserInfo();
		uiConsole(user);
	};

	const logout = async () => {
		if (!web3auth) {
			uiConsole('web3auth not initialized yet');
			return;
		}
		await web3auth.logout();
		setProvider(null);
	};

	const getAccounts = async () => {
		if (!provider) {
			uiConsole('provider not initialized yet');
			return;
		}
		const rpc = new RPC(provider);
		const userAccount = await rpc.getAccounts();
		uiConsole(userAccount);
	};

	const getBalance = async () => {
		if (!provider) {
			uiConsole('provider not initialized yet');
			return;
		}
		const rpc = new RPC(provider);
		const balance = await rpc.getBalance();
		uiConsole(balance);
	};

	const signMessage = async () => {
		if (!provider) {
			uiConsole('provider not initialized yet');
			return;
		}
		const rpc = new RPC(provider);
		const result = await rpc.signMessage();
		uiConsole(result);
	};

	const signTransaction = async () => {
		if (!provider) {
			uiConsole('provider not initialized yet');
			return;
		}
		const rpc = new RPC(provider);
		const result = await rpc.signTransaction();
		uiConsole(result);
	};

	const sendTransaction = async () => {
		if (!provider) {
			uiConsole('provider not initialized yet');
			return;
		}
		const rpc = new RPC(provider);
		const result = await rpc.sendTransaction();
		uiConsole(result);
	};

	const getChainId = async () => {
		if (!provider) {
			uiConsole('provider not initialized yet');
			return;
		}
		const rpc = new RPC(provider);
		const chainId = await rpc.getChainId();
		uiConsole(chainId);
	};

	function uiConsole(...args: any[]): void {
		const el = document.querySelector('#console>p');
		if (el) {
			el.innerHTML = JSON.stringify(args || {}, null, 2);
		}
	}

	const loggedInView = (
		<>
			<div className='flex-container'>
				<div>
					<button onClick={getUserInfo} className='card'>
						Get User Info
					</button>
				</div>
				<div>
					<button onClick={authenticateUser} className='card'>
						Get idToken
					</button>
				</div>
				<div>
					<button onClick={parseToken} className='card'>
						Parse idToken
					</button>
				</div>
				<div>
					<button onClick={getChainId} className='card'>
						Get Chain ID
					</button>
				</div>
				<div>
					<button onClick={getAccounts} className='card'>
						Get ETH Account
					</button>
				</div>
				<div>
					<button onClick={getBalance} className='card'>
						Get Balance
					</button>
				</div>
				<div>
					<button onClick={signMessage} className='card'>
						Sign Message
					</button>
				</div>
				<div>
					<button onClick={signTransaction} className='card'>
						Sign Transaction
					</button>
				</div>
				<div>
					<button onClick={sendTransaction} className='card'>
						Send Transaction
					</button>
				</div>
				<div>
					<button onClick={logout} className='card'>
						Log Out
					</button>
				</div>
			</div>
			<div id='console' style={{ whiteSpace: 'pre-line' }}>
				<p style={{ whiteSpace: 'pre-line' }} />
			</div>
		</>
	);

	const unloggedInView = (
		<button disabled={!web3auth} onClick={login} className='card'>
			{web3auth ? 'Login' : 'Loading...'}
		</button>
	);

	return (
		<div className='container'>
			<h1 className='title'>
				<a target='_blank' href='http://web3auth.io/' rel='noreferrer'>
					Web3Auth
				</a>{' '}
				& ReactJS Example using Auth0
			</h1>

			<h4 className='sub-title'>Google & SMS Login</h4>

			<div className='grid'>{provider ? loggedInView : unloggedInView}</div>

			<footer className='footer'>
				<a
					href='https://github.com/shahbaz17/web3auth-auth0-react-demo'
					target='_blank'
					rel='noopener noreferrer'
				>
					Source code
				</a>
				<p>
					Note: For testing, SMS login only works with +65 and +91 numbers.{' '}
				</p>
			</footer>
		</div>
	);
}

export default App;
