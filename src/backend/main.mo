import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  include MixinStorage();

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  // User Profiles Storage
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Product Type
  public type Product = {
    id : Text;
    name : Text;
    description : Text;
    priceCents : Nat;
    imageId : ?Text;
    inStock : Bool;
    createdAt : Int;
    image : ?Storage.ExternalBlob;
  };

  // Persistent Products
  let productsMap = Map.empty<Text, Product>();

  // Seed products
  let defaultProducts : [Product] = [
    {
      id = "1";
      name = "Classic Leather Purse";
      description = "A timeless leather purse for everyday use.";
      priceCents = 9999;
      imageId = ?"leather_purse_image";
      inStock = true;
      createdAt = Time.now();
      image = null;
    },
    {
      id = "2";
      name = "Elegant Evening Purse";
      description = "Perfect for formal occasions.";
      priceCents = 7499;
      imageId = ?"evening_purse_image";
      inStock = true;
      createdAt = Time.now();
      image = null;
    },
    {
      id = "3";
      name = "Casual Canvas Tote";
      description = "A sturdy and stylish tote for shopping.";
      priceCents = 3999;
      imageId = ?"tote_image";
      inStock = true;
      createdAt = Time.now();
      image = null;
    },
  ];

  // Initialize with seed data
  for (product in defaultProducts.values()) {
    productsMap.add(product.id, product);
  };

  // Public queries for shop
  public query func getProducts() : async [Product] {
    productsMap.values().toArray();
  };

  public query func getProduct(id : Text) : async ?Product {
    productsMap.get(id);
  };

  // Admin CRUD for products
  public shared ({ caller }) func addProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    productsMap.add(product.id, product);
  };

  public shared ({ caller }) func updateProduct(id : Text, updatedProduct : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (productsMap.get(id)) {
      case (null) { () };
      case (?_) {
        let productWithCorrectId = {
          updatedProduct with id;
        };
        productsMap.add(id, productWithCorrectId);
      };
    };
  };

  public shared ({ caller }) func removeProduct(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    productsMap.remove(id);
  };

  public shared ({ caller }) func toggleProductStock(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (productsMap.get(id)) {
      case (null) { () };
      case (?product) {
        let updatedProduct = {
          product with inStock = not product.inStock;
        };
        productsMap.add(id, updatedProduct);
      };
    };
  };
};
