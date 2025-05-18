import { Pokemon } from './pokemon.entity';

describe('PokemonEntity', () => {
    it('should create a Pokemon instance', () => {
        const pokemon = new Pokemon();

        expect(pokemon).toBeInstanceOf(Pokemon);
    });

    it('should have these properties', () => {
        const pokemon = new Pokemon();
        pokemon.id = 1;
        pokemon.name = 'Pikachu';
        pokemon.type = 'Electric';
        pokemon.hp = 10;
        pokemon.sprites = ['sprite1.png', 'sprite2.png'];

        expect(JSON.stringify(pokemon)).toEqual(
            '{"id":1,"name":"Pikachu","type":"Electric","hp":10,"sprites":["sprite1.png","sprite2.png"]}',
        );
    });
});
