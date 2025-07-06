/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('emails', function(table) {
    table.boolean('read').defaultTo(false);
    table.boolean('starred').defaultTo(false);
    
    // Add indexes for better performance
    table.index(['read']);
    table.index(['starred']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('emails', function(table) {
    table.dropColumn('read');
    table.dropColumn('starred');
  });
};
