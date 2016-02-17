/**
 * Class patches ContractsParser class to process callput contracts as Rise/Fall and Higher/Lower
 *
 * @class ContractsPatchedForCallput
 * @constructor
 * @extends ContractsParser
 *
 */

import ContractsParser from './contracts';
import Text from '../helpers/text';

export default class ContractsPatchedForCallput extends ContractsParser {

    /**
     * Patches _addDataToTree to process callput contracts as Rise/Fall and Higher/Lower
     * @method _addDataToTree
     * @private
     * @param {Map()} tree
     * @param {Map()} contract
     * @return {Map()} tree
     */
    _addDataToTree(tree = Map(), c) {
        if (c.get('contract_category') === 'callput') {

            if (c.get('barrier_category') === 'euro_non_atm') {
                c = c.set('contract_category', 'higherlower').set('contract_category_display', Text._('Higher/Lower'));
            } else {
                c = c.set('contract_category', 'risefall').set('contract_category_display', Text._('Rise/Fall'));
            }
        }
        return super._addDataToTree(tree, c);
    }
}
