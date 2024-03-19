const { Client } = require('pg');

class Model {
  constructor() {
    this.client = new Client({
      user: 'postgres',
      host: 'localhost',
      database: 'postgres',
      password: '',
      port: 5432,
    });
  }

  async init() {
    await this.client.connect();
    await this.setupUser();
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

  async validAuth(username){
    const result = await this.client.query(`
    SELECT password FROM public.users
    WHERE username = $1
  `, [username]);
    if(result.rows.length > 0){
      return true
    } else {
      return false
    }
  }

  async getAllStores() {
    const res = await this.client.query('SELECT * FROM public.stores ORDER BY id ASC;');
    return res.rows;
  }

  async setupUser(){
    await this.client.query(`
      CREATE TABLE IF NOT EXISTS public.users
      (
        id SERIAL NOT NULL,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        CONSTRAINT users_pkey PRIMARY KEY (id)
      );
    `);
    await this.client.query(`
      INSERT INTO public.users (username, password)
      VALUES ($1, $2)
    `, ['postgres', '12345']);
  }
  
  async update(name,url, district, id){
    const checkForStore = await this.client.query(`
    UPDATE public.stores
    SET name = $1, url = $2, district = $3
    WHERE id = $4
      `, [name, url, district, id]);
  }
}

module.exports = Model;
