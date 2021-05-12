module.exports = {
  getTableById: 'SELECT "%s" as "parentNode", "%s" as "childNode", "%s" as "arcWeight" FROM scenario_%s."%s";',
  getUniqueItems: 'SELECT DISTINCT "%s" as "node", "%s" as "label"%s FROM scenario_%s."%s";',
  getUniqueItemsFiltered : 'SELECT DISTINCT "%s" as "node", "%s" as "label"%s FROM scenario_%s."%s" WHERE "%s" IN (%s)',
  getSpecificValItem: 'SELECT "%s" as "parentNode", "%s" as "childNode", "%s" as "arcWeight" FROM scenario_%s."%s" WHERE "%s" = \'%s\' OR "%s" = \'%s\';'
};
