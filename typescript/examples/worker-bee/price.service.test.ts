import PriceService from './price.service';
import { Subject } from 'rxjs';

describe('PriceService', () => {
    // ...existing code...
    let service: PriceService;
    let socketSubject: Subject<any>;

    beforeEach(() => {
        jest.useFakeTimers();
        service = new PriceService();
        socketSubject = new Subject();
        // Override the alchemySocket to use our subject
        (service as any).alchemySocket = socketSubject.asObservable();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should calculate and compare TWAP across intervals', (done) => {
        const results: { current: number; difference: number }[] = [];
        service.compareTWAP().subscribe(result => {
            results.push(result);
            console.log('check results', results)
            // Wait for two intervals to complete.
            if (results.length === 2) {
                // First interval: average of (100, 200, 150) = 150
                // Second interval: average of (250, 150, 200) = 200, difference = 50
                expect(results[0].current).toBeCloseTo(150);
                expect(results[1].current).toBeCloseTo(200);
                expect(results[1].difference).toBeCloseTo(50);
                done();
            }
        });

        // Emit price updates for the first 1-minute interval.
        socketSubject.next({ symbol: 'ETHUSDC', price: 100 });
        socketSubject.next({ symbol: 'ETHUSDC', price: 200 });
        socketSubject.next({ symbol: 'ETHUSDC', price: 150 });

        // Advance time for the first interval.
        jest.advanceTimersByTime(60000);

        // Emit price updates for the second 1-minute interval.
        socketSubject.next({ symbol: 'ETHUSDC', price: 250 });
        socketSubject.next({ symbol: 'ETHUSDC', price: 150 });
        socketSubject.next({ symbol: 'ETHUSDC', price: 200 });

        // Advance time for the second interval.
        jest.advanceTimersByTime(60000);
    });
    // ...existing code...
});
