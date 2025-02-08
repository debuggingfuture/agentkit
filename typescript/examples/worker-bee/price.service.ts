import { webSocket } from 'rxjs/webSocket';
import { map, bufferTime, filter, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

interface PriceUpdate {
    symbol: string;
    price: number;
}

class PriceService {
    private alchemySocket = webSocket('wss://eth-mainnet.alchemyapi.io/v2/your-api-key');
    private twapHistory: number[] = [];

    getPriceUpdates(): Observable<PriceUpdate> {
        return this.alchemySocket.pipe(
            filter((data: any) => data.symbol === 'ETHUSDC'),
            map((data: any) => ({ symbol: data.symbol, price: data.price }))
        );
    }

    calculateTWAP(interval: number): Observable<number> {
        return this.getPriceUpdates().pipe(
            bufferTime(interval),
            map((priceUpdates: PriceUpdate[]) => {
                if (priceUpdates.length === 0) return 0;
                const total = priceUpdates.reduce((sum, update) => sum + update.price, 0);
                return total / priceUpdates.length;
            })
        );
    }

    // New method: Calculate and store TWAP every 1 minute, then compare with previous value.
    compareTWAP(): Observable<{ current: number; difference: number }> {
        return this.calculateTWAP(60000).pipe(
            tap(twap => this.twapHistory.push(twap)),
            map(twap => {
                const len = this.twapHistory.length;
                const previous = len > 1 ? this.twapHistory[len - 2] : 0;
                return { current: twap, difference: twap - previous };
            })
        );
    }
}

export default PriceService;
