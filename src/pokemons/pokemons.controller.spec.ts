import { Test, TestingModule } from '@nestjs/testing';

import { PokemonsController } from './pokemons.controller';
import { PokemonsService } from './pokemons.service';
import { Pokemon } from './entities/pokemon.entity';
import { PaginationDto } from 'src/shared/dtos/pagination.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';

const mockPokemons: Pokemon[] = [
    {
        id: 1,
        name: 'bulbasaur',
        type: 'grass',
        hp: 45,
        sprites: [
            'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
            'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/1.png',
        ],
    },
    {
        id: 2,
        name: 'ivysaur',
        type: 'grass',
        hp: 60,
        sprites: [
            'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png',
            'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/2.png',
        ],
    },
];

describe('PokemonsController', () => {
    let controller: PokemonsController;
    let service: PokemonsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PokemonsController],
            providers: [PokemonsService],
        }).compile();

        controller = module.get<PokemonsController>(PokemonsController);
        service = module.get<PokemonsService>(PokemonsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    // Prueba de integracion por que llega al servicio
    it('should have called the service with correct parameter', async () => {
        const dto: PaginationDto = { limit: 10, page: 1 };

        jest.spyOn(service, 'findAll');

        await controller.findAll(dto);

        expect(service.findAll).toHaveBeenCalled();
        expect(service.findAll).toHaveBeenCalledWith(dto);
    });

    // Prueba unitaria simula respuesta del servicio
    it('should have called the service and check the result', async () => {
        const dto: PaginationDto = { limit: 10, page: 1 };

        jest.spyOn(service, 'findAll').mockImplementation(() =>
            Promise.resolve(mockPokemons),
        );

        const pokemons = await controller.findAll(dto);

        expect(pokemons).toBe(mockPokemons);
        expect(pokemons.length).toBe(mockPokemons.length);
    });

    it('should have called the service with the correct id (findOne)', async () => {
        const spy = jest
            .spyOn(service, 'findOne')
            .mockImplementation(() => Promise.resolve(mockPokemons[0]));

        const id = '1';

        const pokemon = await controller.findOne(id);

        expect(spy).toHaveBeenCalledWith(+id);
        expect(pokemon).toEqual(mockPokemons[0]);
    });

    it('should have called the service with the correct id and data (update)', async () => {
        jest.spyOn(service, 'update').mockImplementation(() =>
            Promise.resolve(mockPokemons[0]),
        );

        const id = '1';
        const dto: UpdatePokemonDto = {
            name: 'Bulbasaur Temporal',
            type: 'Fire',
        };

        await controller.update(id, dto);

        expect(service.update).toHaveBeenCalledWith(+id, dto);
    });

    it('should have called delete with the correct id (delete)', async () => {
        jest.spyOn(service, 'remove').mockImplementation(() =>
            Promise.resolve('Pokemon deleted'),
        );

        const id = '1';

        const result = await controller.remove(id);

        expect(result).toBe('Pokemon deleted');
    });

    it('should call create service method', async () => {
        jest.spyOn(service, 'create').mockImplementation(() =>
            Promise.resolve(mockPokemons[0]),
        );

        const data = { name: 'Pikachu', type: 'Electric' };

        await controller.create(data);

        expect(service.create).toHaveBeenCalledWith(data);
    });
});
