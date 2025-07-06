/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('emails', table => {
        table.increments('id').primary();
        table.string('to', 255).notNullable();
        table.string('cc', 255);
        table.string('bcc', 255);
        table.string('subject', 255).notNullable();
        table.text('body').notNullable();
        table.boolean('read').defaultTo(false);
        table.boolean('starred').defaultTo(false);
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        
        // Indexes for better performance
        table.index(['created_at']);
        table.index(['read']);
        table.index(['starred']);
        table.index(['to']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('emails');
};
