declare class ConnectionCosts {
    #private;
    forward_dimension: number;
    backward_dimension: number;
    constructor(forward_dimension: number, backward_dimension: number);
    put(forward_id: number, backward_id: number, cost: number): void;
    get(forward_id: number, backward_id: number): number;
    loadConnectionCosts(connection_costs_buffer: Int16Array): void;
}
export default ConnectionCosts;
