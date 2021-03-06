import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, EMPTY } from "rxjs";
import { map, catchError } from "rxjs/operators";

import { OpenFoodFactsProductResponse, ProductFound } from "./openfoodfacts.interface";
import { getBoolean, setBoolean } from "tns-core-modules/application-settings/application-settings";
import { ExternalProduct } from "./scanned-item-exernal-lookup.service";

@Injectable({
  providedIn: "root"
})
export class OpenFoodFactsService {
  configurationRequired = false;
  constructor(private http: HttpClient) { }

  get enabled() {
    return getBoolean("openfoodfacts.enabled", true);
  }

  set enabled(val: boolean) {
    setBoolean("openfoodfacts.enabled", val);
  }

  searchForBarcode(barcode: string): Observable<ExternalProduct> {
    if (!this.enabled) {
      return EMPTY;
    }

    return this.http.get<OpenFoodFactsProductResponse>(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    ).pipe(
      map(i => {
        if (i.status === 0 || !i.product.product_name) {
          throw new Error("Product not found");
        } else {
          let name = i.product.product_name;

          if (i.product.brands) {
            name += ` (${i.product.brands})`;
          }

          return { name };
        }
      }),
      catchError(() => EMPTY)
    );
  }
}
