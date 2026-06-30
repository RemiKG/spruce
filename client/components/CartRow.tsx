/* Spruce — one row of the sourced cart (thumbnail, name, retailer, price, state).
   Every row deep-links to the real retailer page at the shown price. */
import { Thumbnail } from '../lib/svg';
import { money } from '../../shared/numbers';
import type { CartItem } from '../../shared/types';

export function CartRow({ item, showState = true, showOpen = false, showWhy = false }: {
  item: CartItem; showState?: boolean; showOpen?: boolean; showWhy?: boolean;
}) {
  const p = item.product;
  const dropped = item.state === 'dropped';
  const stock = p.inStock ? 'in stock' : 'sold out';
  const delivery = p.deliveryDays ? `${p.deliveryDays[0]}–${p.deliveryDays[1]} day` : p.shipsFree ? 'ships free' : '';
  return (
    <div className="cart-row" style={dropped ? { opacity: 0.5 } : undefined}>
      <div className="cart-thumb"><Thumbnail thumb={p.thumb} /></div>
      <div className="cart-meta">
        <div className="cart-name">{p.title}{p.subtitle ? '' : ''}</div>
        <div className="cart-sub">
          <a className="store" href={p.retailer.url} target="_blank" rel="noopener">{p.retailer.name} ↗</a>
          {' · '}{stock}{delivery ? ` · ${delivery}` : ''}
        </div>
        {showWhy && item.reason && <div className="cart-sub" style={{ color: 'var(--ink-60)' }}>{item.reason}</div>}
      </div>
      <div className="cart-price">
        {dropped ? <><s>{money(p.price, p.currency)}</s> —</> : <>{money(p.price, p.currency)}{item.prevPrice != null && <s>{money(item.prevPrice, p.currency)}</s>}</>}
      </div>
      {showOpen && (
        <a className="btn btn-ghost btn-sm" href={p.retailer.url} target="_blank" rel="noopener" style={{ flex: 'none' }}>Open ↗</a>
      )}
      {showState && (
        <div className={`state ${item.state === 'swapped' ? 'swap' : item.state === 'dropped' ? 'drop' : 'kept'}`}>
          {item.state === 'swapped' ? 'swap ↔' : item.state === 'dropped' ? 'dropped' : item.state === 'added' ? 'sourced' : 'kept ✓'}
        </div>
      )}
    </div>
  );
}
