import type { ContextFile } from '../types/context';
import { SIWE_CONTENT } from '../content/siwe-content';
import { ENS_CONTENT } from '../content/ens-content';
import { EFP_CONTENT } from '../content/efp-content';
import { EIK_CONTENT } from '../content/eik-content';

export const protocolContexts: ContextFile[] = [
  {
    id: 'siwe-protocol',
    name: 'Sign-In with Ethereum (SIWE)',
    description: 'Complete Sign-In with Ethereum documentation including implementation guides, message structure, and best practices',
    category: 'protocols',
    tags: ['siwe', 'sign-in-with-ethereum', 'authentication', 'web3-auth', 'identity', 'message-structure'],
    content: SIWE_CONTENT,
    mimeType: 'text/markdown'
  },
  {
    id: 'ens-protocol',
    name: 'Ethereum Name Service (ENS)',
    description: 'Complete Ethereum Name Service documentation including technical specifications, registrars, reverse resolution, and DNS integration',
    category: 'protocols',
    tags: ['ens', 'ethereum-name-service', 'dns', 'domains', 'reverse-resolution', 'registrar'],
    content: ENS_CONTENT,
    mimeType: 'text/markdown'
  },
  {
    id: 'efp-protocol',
    name: 'Ethereum Follow Protocol (EFP)',
    description: 'Complete Ethereum Follow Protocol documentation including FAQ, technical details, NFT implementation, and social graph features',
    category: 'protocols',
    tags: ['efp', 'ethereum-follow-protocol', 'social-graph', 'nft', 'onchain', 'list-records'],
    content: EFP_CONTENT,
    mimeType: 'text/markdown'
  },
  {
    id: 'eik-protocol',
    name: 'Ethereum Identity Kit (EIK)',
    description: 'Ethereum Identity Kit documentation for building identity-focused applications with ENS, SIWE, and EFP integration',
    category: 'protocols',
    tags: ['eik', 'ethereum-identity-kit', 'identity', 'ens-integration', 'siwe-integration'],
    content: EIK_CONTENT,
    mimeType: 'text/markdown'
  }
];