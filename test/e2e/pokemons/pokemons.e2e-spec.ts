import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from '../../../src/app.module';
import { Pokemon } from 'src/pokemons/entities/pokemon.entity';

describe('Pokemons (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        // app.setGlobalPrefix('api')
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
            }),
        );

        await app.init();
    });

    it('/pokemons (POST) - with no body ', async () => {
        const response = await request(app.getHttpServer()).post('/pokemons');

        const messageArray = response.body.message ?? [];

        expect(response.statusCode).toBe(400);

        expect(messageArray).toContain('name must be a string');
        expect(messageArray).toContain('name should not be empty');
        expect(messageArray).toContain('type must be a string');
        expect(messageArray).toContain('type should not be empty');
    });

    it('/pokemons (POST) - with no body 2', async () => {
        const response = await request(app.getHttpServer()).post('/pokemons');

        const mostHaveErrorMessage = [
            'type should not be empty',
            'name must be a string',
            'type must be a string',
            'name should not be empty',
        ];

        const messageArray: string[] = response.body.message ?? [];

        expect(mostHaveErrorMessage.length).toBe(messageArray.length);
        expect(messageArray).toEqual(
            expect.arrayContaining(mostHaveErrorMessage),
        );
    });

    it('/pokemons (POST) - with valid body', async () => {
        const data = {
            name: 'Pikachu',
            type: 'Electric',
        };
        const response = await request(app.getHttpServer())
            .post('/pokemons')
            .send(data);

        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({
            ...data,
            id: expect.any(Number),
            hp: 0,
            sprites: [],
        });
    });

    it('/pokemons (GET) should return paginated list of pokemons', async () => {
        const query = { limit: 5, page: 1 };
        const response = await request(app.getHttpServer())
            .get('/pokemons')
            .query(query);

        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body.length).toBe(query.limit);

        (response.body as Pokemon[]).forEach((pokemon) => {
            expect(pokemon).toHaveProperty('id');
            expect(pokemon).toHaveProperty('name');
            expect(pokemon).toHaveProperty('type');
            expect(pokemon).toHaveProperty('hp');
            expect(pokemon).toHaveProperty('sprites');
        });
    });

    it('/pokemons/:id (GET) should return a Pokémon by ID', async () => {
        const id = 1;
        const response = await request(app.getHttpServer()).get(
            `/pokemons/${id}`,
        );

        const pokemon = response.body as Pokemon;

        expect(response.statusCode).toBe(200);
        expect(pokemon).toEqual({
            id,
            name: 'bulbasaur',
            type: 'grass',
            hp: 45,
            sprites: [
                'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
                'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/1.png',
            ],
        });
    });

    it('/pokemons/:id (GET) should return a Charmander', async () => {
        const response = await request(app.getHttpServer()).get('/pokemons/4');

        const pokemon = response.body as Pokemon;

        expect(response.statusCode).toBe(200);
        expect(pokemon).toEqual({
            id: 4,
            name: 'charmander',
            type: 'fire',
            hp: 39,
            sprites: [
                'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png',
                'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/4.png',
            ],
        });
    });

    it('/pokemons/:id (GET) should return Not found', async () => {
        const pokemonId = 400_000;
        const response = await request(app.getHttpServer()).get(
            `/pokemons/${pokemonId}`,
        );

        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({
            message: `Pokemon with id ${pokemonId} not found`,
            error: 'Not Found',
            statusCode: 404,
        });
    });

    it('/pokemons/:id (PATCH) should update pokemon', async () => {
        const pokemonId = 1;
        const dto = { name: 'Pikachu', type: 'Electric' };
        const pokemonResponse = await request(app.getHttpServer()).get(
            `/pokemons/${pokemonId}`,
        );

        const bulbasaur = pokemonResponse.body as Pokemon;

        const response = await request(app.getHttpServer())
            .patch(`/pokemons/${pokemonId}`)
            .send(dto);

        const updatedPokemon = response.body as Pokemon;

        // expect(bulbasaur).toEqual(updatedPokemon);
        expect(bulbasaur.hp).toBe(updatedPokemon.hp);
        expect(bulbasaur.id).toBe(updatedPokemon.id);
        expect(bulbasaur.sprites).toEqual(updatedPokemon.sprites);

        expect(updatedPokemon.name).toBe(dto.name);
        expect(updatedPokemon.type).toBe(dto.type);
    });

    it('/pokemons/:id (PATCH) should throw an 404', async () => {
        const id = 4_000_000;

        const pokemonResponse = await request(app.getHttpServer())
            .patch(`/pokemons/${id}`)
            .send({});

        expect(pokemonResponse.statusCode).toBe(404);
    });

    it('/pokemons/:id (DELETE) should delete pokemon', async () => {
        const id = 1;

        const pokemonResponse = await request(app.getHttpServer()).delete(
            `/pokemons/${id}`,
        );

        expect(pokemonResponse.statusCode).toBe(200);
        expect(pokemonResponse.text).toBe(`Pokemon bulbasaur removed!`);
    });

    it('/pokemons/:id (DELETE) should return 404', async () => {
        const id = 1_000_000;

        const pokemonResponse = await request(app.getHttpServer()).delete(
            `/pokemons/${id}`,
        );

        expect(pokemonResponse.statusCode).toBe(404);
    });
});
