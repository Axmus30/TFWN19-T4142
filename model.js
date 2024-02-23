const { Client } = require('pg');

class Model {
  constructor() {
    this.client = new Client({
      user: 'postgres',
      host: 'localhost',
      database: 'postgres',
      password: '99Axelostan',
      port: 5432,
    });
  }

  async init() {
    await this.client.connect();
  }
ç
  async setup(storeJson) {
    await this.client.query(`
      CREATE TABLE IF NOT EXISTS public.stores
      (
          id SERIAL NOT NULL,
          name text,
          url text,
          district text,
          CONSTRAINT stores_pkey PRIMARY KEY (id)
      );
    `);

    await this.client.query(`
      ALTER TABLE IF EXISTS public.stores OWNER to postgres;
    `);

    for (const store of storeJson) {
      const checkForStore = await this.client.query(`
        SELECT * FROM public.stores
        WHERE
         name = $1
        LIMIT 1
      `, [store.name]);

      console.log(checkForStore.rows);

      if (checkForStore.rows.length === 0) {
        await this.client.query(`
          INSERT INTO public.stores (name, url, district)
          VALUES ($1, $2, $3)
        `, [store.name, store.url, store.district]);
      }
    }


  }

  async getAllStores() {
    const res = await this.client.query('SELECT * FROM public.stores');
    return res.rows;
  }

}

module.exports = Model;
