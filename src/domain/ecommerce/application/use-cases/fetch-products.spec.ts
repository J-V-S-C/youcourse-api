import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository';
import { FetchProductsUseCase } from './fetch-products';
import { makeProduct } from 'test/factories/make-product';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { ProductMetrics } from '../../enterprise/entities/product-metrics';

let inMemoryProductsRepository: InMemoryProductsRepository;
let sut: FetchProductsUseCase;

describe('Fetch Product', () => {
  beforeEach(() => {
    inMemoryProductsRepository = new InMemoryProductsRepository();
    sut = new FetchProductsUseCase(inMemoryProductsRepository);
  });

  it('should be able to fetch recent products', async () => {
    inMemoryProductsRepository.create(
      makeProduct({
        createdAt: new Date(2026, 0, 20),
        visible: true,
      }),
    );

    inMemoryProductsRepository.create(
      makeProduct({
        createdAt: new Date(2026, 1, 20),
        visible: true,
      }),
    );

    inMemoryProductsRepository.create(
      makeProduct({
        createdAt: new Date(2026, 0, 19),
        visible: true,
      }),
    );

    const result = await sut.execute({
      page: 1,
      perPage: 10,
      orderBy: 'recent',
    });

    expect(result.isRight()).toBeTruthy();
    expect(result.value?.visibleProducts).toEqual([
      expect.objectContaining({ createdAt: new Date(2026, 1, 20) }),
      expect.objectContaining({ createdAt: new Date(2026, 0, 20) }),
      expect.objectContaining({ createdAt: new Date(2026, 0, 19) }),
    ]);
  });

  it('should fetch products ordered by popularity', async () => {
    const p1 = makeProduct({ visible: true }, new UniqueEntityID('1'));
    const p2 = makeProduct({ visible: true }, new UniqueEntityID('2'));
    const p3 = makeProduct({ visible: true }, new UniqueEntityID('3'));

    await inMemoryProductsRepository.create(p1);
    await inMemoryProductsRepository.create(p2);
    await inMemoryProductsRepository.create(p3);

    inMemoryProductsRepository.metrics.set(
      '1',
      ProductMetrics.create({
        productId: p2.id,
        views: 100,
        clicks: 2,
        sales: 0,
        updatedAt: new Date(),
      }),
    );

    inMemoryProductsRepository.metrics.set(
      '2',
      ProductMetrics.create({
        productId: p1.id,
        views: 10,
        clicks: 5,
        sales: 1,
        updatedAt: new Date(),
      }),
    );

    inMemoryProductsRepository.metrics.set(
      '3',
      ProductMetrics.create({
        productId: p3.id,
        views: 5,
        clicks: 1,
        sales: 3,
        updatedAt: new Date(),
      }),
    );

    const result = await sut.execute({
      page: 1,
      perPage: 10,
      orderBy: 'popular',
    });

    expect(result.isRight()).toBe(true);
    expect(result.value!.visibleProducts.map((p) => p.id.toString())).toEqual([
      '3',
      '2',
      '1',
    ]);
  });

  it('should return products ordered by best sales', async () => {
    const p1 = makeProduct({ visible: true }, new UniqueEntityID('1'));
    const p2 = makeProduct({ visible: true }, new UniqueEntityID('2'));
    const p3 = makeProduct({ visible: true }, new UniqueEntityID('3'));

    await inMemoryProductsRepository.create(p1);
    await inMemoryProductsRepository.create(p2);
    await inMemoryProductsRepository.create(p3);

    inMemoryProductsRepository.metrics.set(
      '1',
      ProductMetrics.create({
        productId: p1.id,
        views: 0,
        clicks: 0,
        sales: 10,
        updatedAt: new Date(),
      }),
    );

    inMemoryProductsRepository.metrics.set(
      '2',
      ProductMetrics.create({
        productId: p2.id,
        views: 0,
        clicks: 0,
        sales: 3,
        updatedAt: new Date(),
      }),
    );

    inMemoryProductsRepository.metrics.set(
      '3',
      ProductMetrics.create({
        productId: p3.id,
        views: 0,
        clicks: 0,
        sales: 20,
        updatedAt: new Date(),
      }),
    );

    const result = await sut.execute({
      page: 1,
      perPage: 10,
      orderBy: 'bestSelling',
    });

    expect(result.value!.visibleProducts.map((p) => p.id.toString())).toEqual([
      '3',
      '1',
      '2',
    ]);
  });

  it('should return only visible products', async () => {
    const visibleSellable = makeProduct({ visible: true, sellable: true });
    const visibleNotSellable = makeProduct({ visible: true, sellable: false });
    const hidden = makeProduct({ visible: false, sellable: true });

    await inMemoryProductsRepository.create(visibleSellable);
    await inMemoryProductsRepository.create(visibleNotSellable);
    await inMemoryProductsRepository.create(hidden);

    const result = await sut.execute({
      page: 1,
      perPage: 10,
      orderBy: 'recent',
    });

    expect(result.value!.visibleProducts).toHaveLength(2);
    expect(result.value!.visibleProducts.every((p) => p.visible)).toBe(true);
  });
});
