export class ViterbiSearcher {
    #connection_costs;
    /**
     * ViterbiSearcher is for searching best Viterbi path
     * @param {ConnectionCosts} connection_costs Connection costs matrix
     * @constructor
     */
    constructor(connection_costs) {
        this.#connection_costs = connection_costs;
    }
    /**
     * Search best path by forward-backward algorithm
     * @param {ViterbiLattice} lattice Viterbi lattice to search
     * @returns {Array} Shortest path
     */
    search(_lattice) {
        let lattice = _lattice;
        lattice = this.#forward(lattice);
        return this.#backward(lattice);
    }
    #forward(lattice) {
        let i = 1;
        for (i = 1; i <= lattice.eos_pos; i++) {
            const nodes = lattice.nodes_end_at[i];
            if (nodes == null)
                continue;
            for (const node of nodes) {
                let cost = Number.MAX_VALUE;
                let shortest_prev_node = null;
                const index = node.start_pos - 1;
                if (!(index in lattice.nodes_end_at)) {
                    // TODO process unknown words (repair word lattice)
                    continue;
                }
                const prev_nodes = lattice.nodes_end_at[index];
                if (prev_nodes == null) {
                    throw new Error(`No previous nodes at ${index}`);
                }
                for (const prev_node of prev_nodes) {
                    let edge_cost;
                    if (node.left_id == null || prev_node.right_id == null) {
                        throw new Error("Left or right is null");
                        edge_cost = 0;
                    }
                    else {
                        edge_cost = this.#connection_costs.get(prev_node.right_id, node.left_id) ?? 0;
                    }
                    const _cost = prev_node.shortest_cost + edge_cost + node.cost;
                    if (_cost < cost) {
                        shortest_prev_node = prev_node;
                        cost = _cost;
                    }
                }
                node.prev = shortest_prev_node;
                node.shortest_cost = cost;
            }
        }
        return lattice;
    }
    #backward(lattice) {
        const shortest_path = [];
        const eosNodes = lattice.nodes_end_at[lattice.nodes_end_at.length - 1];
        if (eosNodes === undefined) {
            throw new Error(`No nodes at EOS: ${lattice.nodes_end_at.length - 1}`);
        }
        const eos = eosNodes[0];
        if (eos === undefined) {
            throw new Error(`No EOS node at EOS: ${lattice.nodes_end_at.length - 1}`);
        }
        let node_back = eos.prev;
        if (node_back == null) {
            return [];
        }
        while (node_back.type !== "BOS") {
            shortest_path.push(node_back);
            if (node_back.prev == null) {
                // TODO Failed to back. Process unknown words?
                return [];
            }
            node_back = node_back.prev;
        }
        return shortest_path.reverse();
    }
}
//# sourceMappingURL=viterbi-searcher.js.map