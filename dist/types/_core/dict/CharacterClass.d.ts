declare class CharacterClass {
    class_id: number;
    class_name: string;
    is_always_invoke: boolean;
    is_grouping: boolean;
    max_length: number;
    /**
     * CharacterClass
     * @param {number} class_id
     * @param {string} class_name
     * @param {boolean} is_always_invoke
     * @param {boolean} is_grouping
     * @param {number} max_length
     * @constructor
     */
    constructor(class_id: number, class_name: string, is_always_invoke: boolean, is_grouping: boolean, max_length: number);
}
export default CharacterClass;
