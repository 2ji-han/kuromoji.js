import ConnectionCosts from "../ConnectionCosts";
declare class ConnectionCostsBuilder {
    lines: number;
    connection_cost: null | ConnectionCosts;
    /**
     * Builder class for constructing ConnectionCosts object
     * @constructor
     */
    constructor();
    putLine(line: string): this;
    build(): ConnectionCosts;
}
export default ConnectionCostsBuilder;
