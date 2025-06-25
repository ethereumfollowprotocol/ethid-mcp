import type { FileContextConfig } from '../utils/file-context-loader';

export const protocolContextConfigs: FileContextConfig[] = [
	{
		id: 'efp',
		name: 'Ethereum Follow Protocol',
		description: 'Complete Ethereum Follow Protocol documentation including FAQ, technical details, and implementation guide',
		filename: 'llms-efp.txt',
		category: 'protocols',
		tags: ['efp', 'ethereum-follow-protocol', 'social-graph', 'nft', 'onchain'],
		sections: {
			faq: {
				startMarker: '**What is the Ethereum Follow Protocol (EFP)?**',
				endMarker: '---',
			},
			nft: {
				startMarker: '## EFP List NFT',
				endMarker: '## List Storage Location',
			},
			storage: {
				startMarker: '## List Storage Location',
				endMarker: '## List Records',
			},
			records: {
				startMarker: '## List Records',
				endMarker: '## EFP List Manager',
			},
			manager: {
				startMarker: '## EFP List Manager',
				endMarker: '## Primary Lists',
			},
			primary: {
				startMarker: '## Primary Lists',
				endMarker: '## ENS Support',
			},
			ens: {
				startMarker: '## ENS Support',
				endMarker: '## EFP Tags',
			},
			tags: {
				startMarker: '## EFP Tags',
				endMarker: '## List Metadata',
			},
		},
	},
	{
		id: 'eik',
		name: 'Ethereum Identity Kit',
		description: 'Comprehensive documentation covering EFP, ENS, SIWE and the complete Ethereum identity stack',
		filename: 'llms-eik.txt',
		category: 'protocols',
		tags: ['ethereum-identity', 'efp', 'ens', 'siwe', 'web3-identity', 'comprehensive'],
		sections: {
			introduction: {
				startMarker: '# Aggregated Ethereum Identity Context - Full',
				endMarker: '# docs.efp.app llms-full.txt',
			},
			'efp-overview': {
				startMarker: '# docs.efp.app llms-full.txt',
				endMarker: '# docs.ens.domains llms.txt',
			},
			'ens-overview': {
				startMarker: '# docs.ens.domains llms.txt',
				endMarker: '# docs.login.xyz llms.txt',
			},
			'siwe-overview': {
				startMarker: '# docs.login.xyz llms.txt',
			},
		},
	},
	{
		id: 'ens',
		name: 'Ethereum Name Service',
		description: 'Complete Ethereum Name Service documentation including technical specifications, registrars, and DNS integration',
		filename: 'llms-ens.txt',
		category: 'protocols',
		tags: ['ens', 'ethereum-name-service', 'dns', 'domains', 'reverse-resolution'],
		sections: {
			'reverse-registrar': {
				startMarker: '# Reverse Registrar [Registrar responsible for Primary Names]',
				endMarker: '# DNS Registrar',
			},
			'dns-registrar': {
				startMarker: '# DNS Registrar',
				endMarker: '# ENS Manager',
			},
			manager: {
				startMarker: '# ENS Manager',
				endMarker: '# ENS Subgraph',
			},
			subgraph: {
				startMarker: '# ENS Subgraph',
				endMarker: '# Web',
			},
			web: {
				startMarker: '# Web',
				endMarker: '# Resolution',
			},
			resolution: {
				startMarker: '# Resolution',
				endMarker: '# Registration',
			},
			registration: {
				startMarker: '# Registration',
				endMarker: '# Managing Names',
			},
		},
	},
	{
		id: 'siwe',
		name: 'Sign-In with Ethereum',
		description: 'Complete Sign-In with Ethereum documentation including implementation guides and best practices',
		filename: 'llms-siwe.txt',
		category: 'protocols',
		tags: ['siwe', 'sign-in-with-ethereum', 'authentication', 'web3-auth', 'identity'],
		sections: {
			introduction: {
				startMarker: '# docs.login.xyz llms.txt',
				endMarker: '# Quickstart Guide',
			},
			quickstart: {
				startMarker: '# Quickstart Guide',
				endMarker: '# Creating SIWE Messages',
			},
			messages: {
				startMarker: '# Creating SIWE Messages',
				endMarker: '# Implement the Frontend',
			},
			frontend: {
				startMarker: '# Implement the Frontend',
				endMarker: '# Implement the Backend',
			},
			backend: {
				startMarker: '# Implement the Backend',
				endMarker: '# Libraries',
			},
			libraries: {
				startMarker: '# Libraries',
			},
		},
	},
];

// Helper function to get protocol contexts by tag
export function getProtocolContextsByTag(tag: string): FileContextConfig[] {
	return protocolContextConfigs.filter((config) => config.tags?.includes(tag));
}

// Helper function to get available sections for a protocol
export function getProtocolSections(protocolId: string): string[] {
	const config = protocolContextConfigs.find((c) => c.id === protocolId);
	return config?.sections ? Object.keys(config.sections) : [];
}
