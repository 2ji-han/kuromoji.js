import { ConnectionCosts } from "../connection-costs.js";
export declare class ConnectionCostsBuilder {
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
//# sourceMappingURL=connection-costs-builder.d.ts.map