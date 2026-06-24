/* Spruce — the catalog MCP server (SSE/stdio). Exposes the curated product
   catalog (photo-less records: real retailer, real product URL, captured price,
   dimensions, stock, delivery) as MCP tools, so the qwen3.7-max agentic loop
   (or Slack / Telegram, per the pro-tips) can source against it. Run: npm run mcp
   Register in a Qwen Responses-API request as an SSE MCP server. */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { loadCatalog, searchCatalog, findProduct } from '../server/catalog';

const server = new Server(
  { name: 'spruce-catalog', version: '1.0.0' },
  { capabilities: { tools: {} } },
);

const TOOLS = [
  {
    name: 'catalog_search',
    description: 'Search the Spruce product catalog for real, buyable pieces. Filter by room slot, free text, region, and a max price. Returns real product records with a live retailer link.',
    inputSchema: {
      type: 'object',
      properties: {
        slot: { type: 'string', description: 'seating_primary | lighting | coffee_table | rug | seating_secondary | side_table | plant | wall_art | storage' },
        q: { type: 'string', description: 'free-text query (material, colour, style)' },
        maxPrice: { type: 'number' },
        region: { type: 'string' },
        inStockOnly: { type: 'boolean' },
      },
    },
  },
  {
    name: 'catalog_get',
    description: 'Get one product record by id, including its real retailer URL and captured price/stock.',
    inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
  },
  {
    name: 'catalog_slots',
    description: 'List the room slots and how many real products the catalog has for each.',
    inputSchema: { type: 'object', properties: {} },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args = {} } = req.params as any;
  const text = (v: unknown) => ({ content: [{ type: 'text', text: JSON.stringify(v, null, 2) }] });
  if (name === 'catalog_search') {
    const results = searchCatalog(args).map((p) => ({
      id: p.id, title: p.title, subtitle: p.subtitle, slot: p.slot, price: p.price, currency: p.currency,
      retailer: p.retailer.name, url: p.retailer.url, dims: p.dims, inStock: p.inStock, capturedAt: p.capturedAt,
    }));
    return text({ count: results.length, results });
  }
  if (name === 'catalog_get') {
    const p = findProduct(String(args.id));
    return p ? text(p) : text({ error: 'not found' });
  }
  if (name === 'catalog_slots') {
    const by: Record<string, number> = {};
    for (const p of loadCatalog()) by[p.slot] = (by[p.slot] || 0) + 1;
    return text({ total: loadCatalog().length, bySlot: by });
  }
  return { content: [{ type: 'text', text: `unknown tool ${name}` }], isError: true };
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('[spruce-catalog MCP] ready on stdio');
