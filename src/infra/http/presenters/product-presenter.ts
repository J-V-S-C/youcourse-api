import { Product } from 'src/domain/e-commerce/enterprise/entities/product';

export class ProductPresenter {
  static toHTTP(product: Product) {
    return {
      name: product.name,
      description: product.description,
      price: product.price,
      visible: product.visible,
      sellable: product.sellable,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
