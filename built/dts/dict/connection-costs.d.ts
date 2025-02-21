export declare class ConnectionCosts {
    #private;
    forward_dimension: number;
    backward_dimension: number;
    constructor(forward_dimension: number, backward_dimension: number);
    get buffer(): Int16Array<ArrayBufferLike>;
    put(forward_id: number, backward_id: number, cost: number): void;
    get(forward_id: number, backward_id: number): number | undefined;
    loadConnectionCosts(connection_costs_buffer: Int16Array): void;
}
//# sourceMappingURL=connection-costs.d.ts.map