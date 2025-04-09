# Dropshipping Platform Veritabanı Şeması

## Genel Bakış
Bu belge, dropshipping platformu için veritabanı şemasını tanımlamaktadır. Şema, tedarikçi yönetimi, ürün ve varyant yönetimi, sipariş işleme, stok takibi ve çok dilli destek gibi temel özellikleri destekleyecek şekilde tasarlanmıştır.

## Veri Modelleri

### 1. Kullanıcı Yönetimi

#### Users
- `id`: INT, PRIMARY KEY, AUTO_INCREMENT
- `email`: VARCHAR(255), UNIQUE
- `password_hash`: VARCHAR(255)
- `first_name`: VARCHAR(100)
- `last_name`: VARCHAR(100)
- `phone`: VARCHAR(20)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP
- `last_login`: TIMESTAMP
- `status`: ENUM('active', 'inactive', 'suspended')
- `user_type`: ENUM('admin', 'supplier', 'dropshipper')
- `preferred_language`: VARCHAR(10), DEFAULT 'en'

#### UserAddresses
- `id`: INT, PRIMARY KEY, AUTO_INCREMENT
- `user_id`: INT, FOREIGN KEY REFERENCES Users(id)
- `address_type`: ENUM('billing', 'shipping', 'business')
- `address_line1`: VARCHAR(255)
- `address_line2`: VARCHAR(255)
- `city`: VARCHAR(100)
- `state`: VARCHAR(100)
- `postal_code`: VARCHAR(20)
- `country`: VARCHAR(100)
- `is_default`: BOOLEAN

### 2. Tedarikçi Yönetimi

#### Suppliers
- `id`: INT, PRIMARY KEY, AUTO_INCREMENT
- `user_id`: INT, FOREIGN KEY REFERENCES Users(id)
- `company_name`: VARCHAR(255)
- `company_description`: TEXT
- `logo_url`: VARCHAR(255)
- `website`: VARCHAR(255)
- `tax_id`: VARCHAR(50)
- `approval_status`: ENUM('pending', 'approved', 'rejected')
- `approval_date`: TIMESTAMP
- `approved_by`: INT, FOREIGN KEY REFERENCES Users(id)
- `rating`: DECIMAL(3,2)
- `total_orders`: INT
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

#### SupplierDocuments
- `id`: INT, PRIMARY KEY, AUTO_INCREMENT
- `supplier_id`: INT, FOREIGN KEY REFERENCES Suppliers(id)
- `document_type`: ENUM('business_license', 'tax_certificate', 'id_proof', 'other')
- `document_url`: VARCHAR(255)
- `uploaded_at`: TIMESTAMP
- `status`: ENUM('pending', 'approved', 'rejected')
- `notes`: TEXT

### 3. Dropshipper Yönetimi

#### Dropshippers
- `id`: INT, PRIMARY KEY, AUTO_INCREMENT
- `user_id`: INT, FOREIGN KEY REFERENCES Users(id)
- `store_name`: VARCHAR(255)
- `store_url`: VARCHAR(255)
- `shopify_store_id`: VARCHAR(100)
- `shopify_api_key`: VARCHAR(255)
- `shopify_api_secret`: VARCHAR(255)
- `shopify_access_token`: VARCHAR(255)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

#### DropshipperSuppliers
- `id`: INT, PRIMARY KEY, AUTO_INCREMENT
- `dropshipper_id`: INT, FOREIGN KEY REFERENCES Dropshippers(id)
- `supplier_id`: INT, FOREIGN KEY REFERENCES Suppliers(id)
- `status`: ENUM('active', 'inactive')
- `created_at`: TIMESTAMP

### 4. Kategori Yönetimi

#### Categories
- `id`: INT, PRIMARY KEY, AUTO_INCREMENT
- `parent_id`: INT, FOREIGN KEY REFERENCES Categories(id)
- `name`: VARCHAR(100)
- `slug`: VARCHAR(100)
- `description`: TEXT
- `image_url`: VARCHAR(255)
- `status`: ENUM('active', 'inactive')
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

#### CategoryTranslations
- `id`: INT, PRIMARY KEY, AUTO_INCREMENT
- `category_id`: INT, FOREIGN KEY REFERENCES Categories(id)
- `language`: VARCHAR(10)
- `name`: VARCHAR(100)
- `description`: TEXT

### 5. Ürün Yönetimi

#### Products
- `id`: INT, PRIMARY KEY, AUTO_INCREMENT
- `supplier_id`: INT, FOREIGN KEY REFERENCES Suppliers(id)
- `category_id`: INT, FOREIGN KEY REFERENCES Categories(id)
- `sku`: VARCHAR(50)
- `barcode`: VARCHAR(50)
- `name`: VARCHAR(255)
- `slug`: VARCHAR(255)
- `description`: TEXT
- `short_description`: TEXT
- `price`: DECIMAL(10,2)
- `cost_price`: DECIMAL(10,2)
- `weight`: DECIMAL(10,2)
- `weight_unit`: ENUM('g', 'kg', 'lb', 'oz')
- `length`: DECIMAL(10,2)
- `width`: DECIMAL(10,2)
- `height`: DECIMAL(10,2)
- `dimension_unit`: ENUM('cm', 'in')
- `status`: ENUM('draft', 'active', 'inactive', 'deleted')
- `is_featured`: BOOLEAN
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

#### ProductTranslations
- `id`: INT, PRIMARY KEY, AUTO_INCREMENT
- `product_id`: INT, FOREIGN KEY REFERENCES Products(id)
- `language`: VARCHAR(10)
- `name`: VARCHAR(255)
- `description`: TEXT
- `short_description`: TEXT

#### ProductImages
- `id`: INT, PRIMARY KEY, AUTO_INCREMENT
- `product_id`: INT, FOREIGN KEY REFERENCES Products(id)
- `image_url`: VARCHAR(255)
- `alt_text`: VARCHAR(255)
- `sort_order`: INT
- `is_primary`: BOOLEAN
- `created_at`: TIMESTAMP

#### ProductVariants
- `id`: INT, PRIMARY KEY, AUTO_INCREMENT
- `product_id`: INT, FOREIGN KEY REFERENCES Products(id)
- `sku`: VARCHAR(50)
- `barcode`: VARCHAR(50)
- `price`: DECIMAL(10,2)
- `cost_price`: DECIMAL(10,2)
- `stock_quantity`: INT
- `weight`: DECIMAL(10,2)
- `weight_unit`: ENUM('g', 'kg', 'lb', 'oz')
- `status`: ENUM('active', 'inactive')
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

#### VariantAttributes
- `id`: INT, PRIMARY KEY, AUTO_INCREMENT
- `variant_id`: INT, FOREIGN KEY REFERENCES ProductVariants(id)
- `attribute_name`: VARCHAR(50)
- `attribute_value`: VARCHAR(50)

#### VariantImages
- `id`: INT, PRIMARY KEY, AUTO_INCREMENT
- `variant_id`: INT, FOREIGN KEY REFERENCES ProductVariants(id)
- `image_url`: VARCHAR(255)
- `alt_text`: VARCHAR(255)
- `sort_order`: INT
- `is_primary`: BOOLEAN
- `created_at`: TIMESTAMP

### 6. Stok Yönetimi

#### Inventory
- `id`: INT, PRIMARY KEY, AUTO_INCREMENT
- `variant_id`: INT, FOREIGN KEY REFERENCES ProductVariants(id)
- `quantity`: INT
- `reserved_quantity`: INT
- `last_updated`: TIMESTAMP

#### InventoryHistory
- `id`: INT, PRIMARY KEY, AUTO_INCREMENT
- `inventory_id`: INT, FOREIGN KEY REFERENCES Inventory(id)
- `previous_quantity`: INT
- `new_quantity`: INT
- `change_reason`: ENUM('order', 'return', 'adjustment', 'sync')
- `reference_id`: VARCHAR(50)
- `created_at`: TIMESTAMP
- `created_by`: INT, FOREIGN KEY REFERENCES Users(id)

### 7. Kargo Yönetimi

#### ShippingMethods
- `id`: INT, PRIMARY KEY, AUTO_INCREMENT
- `supplier_id`: INT, FOREIGN KEY REFERENCES Suppliers(id)
- `name`: VARCHAR(100)
- `description`: TEXT
- `estimated_delivery_days`: INT
- `is_active`: BOOLEAN
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

#### ShippingMethodTranslations
- `id`: INT, PRIMARY KEY, AUTO_INCREMENT
- `shipping_method_id`: INT, FOREIGN KEY REFERENCES ShippingMethods(id)
- `language`: VARCHAR(10)
- `name`: VARCHAR(100)
- `description`: TEXT

#### ShippingRates
- `id`: INT, PRIMARY KEY, AUTO_INCREMENT
- `shipping_method_id`: INT, FOREIGN KEY REFERENCES ShippingMethods(id)
- `country`: VARCHAR(100)
- `region`: VARCHAR(100)
- `base_cost`: DECIMAL(10,2)
- `per_kg_cost`: DECIMAL(10,2)
- `min_weight`: DECIMAL(10,2)
- `max_weight`: DECIMAL(10,2)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### 8. Sipariş Yönetimi

#### Orders
- `id`: INT, PRIMARY KEY, AUTO_INCREMENT
- `dropshipper_id`: INT, FOREIGN KEY REFERENCES Dropshippers(id)
- `supplier_id`: INT, FOREIGN KEY REFERENCES Suppliers(id)
- `shopify_order_id`: VARCHAR(50)
- `order_number`: VARCHAR(50)
- `order_status`: ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')
- `payment_status`: ENUM('pending', 'paid', 'failed', 'refunded')
- `shipping_method_id`: INT, FOREIGN KEY REFERENCES ShippingMethods(id)
- `shipping_cost`: DECIMAL(10,2)
- `subtotal`: DECIMAL(10,2)
- `tax`: DECIMAL(10,2)
- `total`: DECIMAL(10,2)
- `currency`: VARCHAR(3)
- `notes`: TEXT
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

#### OrderItems
- `id`: INT, PRIMARY KEY, AUTO_INCREMENT
- `order_id`: INT, FOREIGN KEY REFERENCES Orders(id)
- `product_id`: INT, FOREIGN KEY REFERENCES Products(id)
- `variant_id`: INT, FOREIGN KEY REFERENCES ProductVariants(id)
- `quantity`: INT
- `price`: DECIMAL(10,2)
- `cost_price`: DECIMAL(10,2)
- `subtotal`: DECIMAL(10,2)
- `tax`: DECIMAL(10,2)
- `total`: DECIMAL(10,2)
- `shopify_line_item_id`: VARCHAR(50)

#### OrderAddresses
- `id`: INT, PRIMARY KEY, AUTO_INCREMENT
- `order_id`: INT, FOREIGN KEY REFERENCES Orders(id)
- `address_type`: ENUM('billing', 'shipping')
- `first_name`: VARCHAR(100)
- `last_name`: VARCHAR(100)
- `company`: VARCHAR(255)
- `address_line1`: VARCHAR(255)
- `address_line2`: VARCHAR(255)
- `city`: VARCHAR(100)
- `state`: VARCHAR(100)
- `postal_code`: VARCHAR(20)
- `country`: VARCHAR(100)
- `phone`: VARCHAR(20)
- `email`: VARCHAR(255)

#### OrderStatusHistory
- `id`: INT, PRIMARY KEY, AUTO_INCREMENT
- `order_id`: INT, FOREIGN KEY REFERENCES Orders(id)
- `previous_status`: ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')
- `new_status`: ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')
- `notes`: TEXT
- `created_at`: TIMESTAMP
- `created_by`: INT, FOREIGN KEY REFERENCES Users(id)

#### Shipments
- `id`: INT, PRIMARY KEY, AUTO_INCREMENT
- `order_id`: INT, FOREIGN KEY REFERENCES Orders(id)
- `tracking_number`: VARCHAR(100)
- `carrier`: VARCHAR(100)
- `shipping_date`: TIMESTAMP
- `estimated_delivery_date`: TIMESTAMP
- `actual_delivery_date`: TIMESTAMP
- `status`: ENUM('pending', 'in_transit', 'delivered', 'failed')
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### 9. Shopify Entegrasyonu

#### ShopifyProducts
- `id`: INT, PRIMARY KEY, AUTO_INCREMENT
- `product_id`: INT, FOREIGN KEY REFERENCES Products(id)
- `dropshipper_id`: INT, FOREIGN KEY REFERENCES Dropshippers(id)
- `shopify_product_id`: VARCHAR(50)
- `shopify_variant_id`: VARCHAR(50)
- `sync_status`: ENUM('pending', 'synced', 'failed')
- `last_synced`: TIMESTAMP
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

#### ShopifyWebhooks
- `id`: INT, PRIMARY KEY, AUTO_INCREMENT
- `dropshipper_id`: INT, FOREIGN KEY REFERENCES Dropshippers(id)
- `webhook_id`: VARCHAR(50)
- `topic`: VARCHAR(100)
- `address`: VARCHAR(255)
- `format`: VARCHAR(20)
- `created_at`: TIMESTAMP

### 10. Çok Dilli Destek

#### Languages
- `code`: VARCHAR(10), PRIMARY KEY
- `name`: VARCHAR(50)
- `native_name`: VARCHAR(50)
- `is_active`: BOOLEAN
- `is_default`: BOOLEAN
- `direction`: ENUM('ltr', 'rtl')
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

#### Translations
- `id`: INT, PRIMARY KEY, AUTO_INCREMENT
- `language`: VARCHAR(10), FOREIGN KEY REFERENCES Languages(code)
- `translation_key`: VARCHAR(255)
- `translation_value`: TEXT
- `context`: VARCHAR(100)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

## İlişkiler

1. Bir kullanıcı birden fazla adrese sahip olabilir (1:N)
2. Bir kullanıcı bir tedarikçi veya dropshipper olabilir (1:1)
3. Bir tedarikçi birden fazla belgeye sahip olabilir (1:N)
4. Bir tedarikçi birden fazla ürüne sahip olabilir (1:N)
5. Bir dropshipper birden fazla tedarikçi ile çalışabilir (N:M)
6. Bir kategori birden fazla alt kategoriye sahip olabilir (1:N)
7. Bir kategori birden fazla dilde çeviriye sahip olabilir (1:N)
8. Bir ürün birden fazla varyanta sahip olabilir (1:N)
9. Bir ürün birden fazla resme sahip olabilir (1:N)
10. Bir ürün birden fazla dilde çeviriye sahip olabilir (1:N)
11. Bir varyant birden fazla özniteliğe sahip olabilir (1:N)
12. Bir varyant birden fazla resme sahip olabilir (1:N)
13. Bir sipariş birden fazla sipariş öğesine sahip olabilir (1:N)
14. Bir sipariş birden fazla adrese sahip olabilir (1:N)
15. Bir sipariş birden fazla durum geçmişine sahip olabilir (1:N)
16. Bir sipariş birden fazla gönderiye sahip olabilir (1:N)

## İndeksler

1. Users tablosunda email sütunu için UNIQUE indeks
2. Products tablosunda sku sütunu için UNIQUE indeks
3. ProductVariants tablosunda sku sütunu için UNIQUE indeks
4. Orders tablosunda order_number sütunu için UNIQUE indeks
5. ShopifyProducts tablosunda shopify_product_id ve shopify_variant_id sütunları için indeks

## Veritabanı Diyagramı

Veritabanı şeması, tedarikçi yönetimi, ürün ve varyant yönetimi, sipariş işleme, stok takibi ve çok dilli destek gibi temel özellikleri destekleyecek şekilde tasarlanmıştır. Şema, Shopify entegrasyonu ve tam otomasyon için gerekli tabloları içermektedir.

Bu şema, platformun geliştirilmesi sırasında ihtiyaçlara göre güncellenebilir ve genişletilebilir.
