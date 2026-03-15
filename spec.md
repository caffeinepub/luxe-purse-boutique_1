# Purse Shop

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Public storefront showing all available purses (name, photo, price, description)
- Product detail view
- Admin panel (login-protected) to manage products: add, edit, delete purses
- Image upload for each purse
- Sample purse products pre-loaded

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Select authorization and blob-storage components
2. Generate Motoko backend with product CRUD (id, name, description, price, imageId, inStock)
3. Build frontend:
   - Public shop page: grid of purse cards with photo, name, price
   - Product detail modal/page
   - Admin login page
   - Admin dashboard: list products, add/edit/delete, image upload
