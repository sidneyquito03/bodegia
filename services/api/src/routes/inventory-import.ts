import { Router } from "express";
import db from "../db/index";
import { z } from "zod";

export const inventoryImportRouter = Router();

const itemSchema = z.object({
  // Campos obligatorios
  codigo: z.string(),
  nombre: z.string(),
  stock: z.number(),
  precio_costo: z.number(),
  precio_venta: z.number(),
  categoria: z.string(),
  estado: z.string().optional().nullable(),
  
  // Campos opcionales básicos
  proveedor_nombre: z.string().optional().nullable(),
  proveedor_id: z.string().optional().nullable(),
  marca: z.string().optional().nullable(),
  medida_peso: z.string().optional().nullable(),
  fecha_vencimiento: z.string().optional().nullable(),
  imagen_url: z.string().optional().nullable(),
  stock_bajo: z.number().optional().nullable(),
  
  // Campos específicos - ROPA/CALZADO
  talla: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  genero: z.string().optional().nullable(),
  tipo_tela: z.string().optional().nullable(),
  
  // Campos específicos - TECNOLOGÍA
  garantia_dias: z.number().optional().nullable(),
  detalles_clave: z.string().optional().nullable(),
  especificacion_electrica: z.string().optional().nullable(),
  
  // Campos específicos - LIBRERÍA
  autor: z.string().optional().nullable(),
  editorial: z.string().optional().nullable(),
  isbn_ean: z.string().optional().nullable(),
  formato_libro: z.string().optional().nullable(),
  numero_paginas: z.number().optional().nullable(),
  
  // Campos específicos - MASCOTAS
  tipo_mascota: z.string().optional().nullable(),
  
  // Campos específicos - BELLEZA/ASEO
  tono_aroma: z.string().optional().nullable(),
  tipo_piel_cabello: z.string().optional().nullable(),
  
  // Campos específicos - ABARROTES
  volumen_peso_neto: z.string().optional().nullable(),
  
  // Campos específicos - HOGAR/MUEBLES
  material: z.string().optional().nullable(),
  alto_cm: z.number().optional().nullable(),
  ancho_cm: z.number().optional().nullable(),
  profundo_cm: z.number().optional().nullable(),
});

inventoryImportRouter.post("/import-json", async (req, res) => {
  const items = z.array(itemSchema).parse(req.body.items);
  let inserted = 0,
    updated = 0,
    errors: any[] = [];

  for (const i of items) {
    try {
      // resolver proveedor
      let proveedor_id = i.proveedor_id;
      if (!proveedor_id && i.proveedor_nombre) {
        const prov = await db.oneOrNone(
          "SELECT id FROM proveedores WHERE LOWER(nombre)=LOWER($1)",
          [i.proveedor_nombre]
        );
        if (prov) proveedor_id = prov.id;
        else {
          const nuevo = await db.one(
            "INSERT INTO proveedores(nombre,activo) VALUES($1,true) RETURNING id",
            [i.proveedor_nombre]
          );
          proveedor_id = nuevo.id;
        }
      }

      const existing = await db.oneOrNone(
        "SELECT id FROM productos WHERE codigo=$1",
        [i.codigo]
      );

      if (existing) {
        await db.none(
          `UPDATE productos
           SET nombre=$1, stock=$2, precio_costo=$3, precio_venta=$4, categoria=$5,
               proveedor_id=$6, marca=$7, medida_peso=$8, fecha_vencimiento=$9,
               imagen_url=$10, stock_bajo=$11, estado=$12,
               talla=$13, color=$14, genero=$15, tipo_tela=$16,
               garantia_dias=$17, detalles_clave=$18, especificacion_electrica=$19,
               autor=$20, editorial=$21, isbn_ean=$22, formato_libro=$23, numero_paginas=$24,
               tipo_mascota=$25, tono_aroma=$26, tipo_piel_cabello=$27,
               volumen_peso_neto=$28, material=$29, alto_cm=$30, ancho_cm=$31, profundo_cm=$32,
               updated_at=NOW()
           WHERE codigo=$33`,
          [
            i.nombre,
            i.stock,
            i.precio_costo,
            i.precio_venta,
            i.categoria,
            proveedor_id ?? null,
            i.marca ?? null,
            i.medida_peso ?? null,
            i.fecha_vencimiento ?? null,
            i.imagen_url ?? null,
            i.stock_bajo ?? 10,
            i.estado ?? 'Disponible',
            i.talla ?? null,
            i.color ?? null,
            i.genero ?? null,
            i.tipo_tela ?? null,
            i.garantia_dias ?? null,
            i.detalles_clave ?? null,
            i.especificacion_electrica ?? null,
            i.autor ?? null,
            i.editorial ?? null,
            i.isbn_ean ?? null,
            i.formato_libro ?? null,
            i.numero_paginas ?? null,
            i.tipo_mascota ?? null,
            i.tono_aroma ?? null,
            i.tipo_piel_cabello ?? null,
            i.volumen_peso_neto ?? null,
            i.material ?? null,
            i.alto_cm ?? null,
            i.ancho_cm ?? null,
            i.profundo_cm ?? null,
            i.codigo,
          ]
        );
        updated++;
      } else {
        await db.none(
          `INSERT INTO productos(nombre,codigo,stock,precio_costo,precio_venta,categoria,
            proveedor_id,marca,medida_peso,fecha_vencimiento,imagen_url,stock_bajo,estado,
            talla,color,genero,tipo_tela,garantia_dias,detalles_clave,especificacion_electrica,
            autor,editorial,isbn_ean,formato_libro,numero_paginas,tipo_mascota,tono_aroma,
            tipo_piel_cabello,volumen_peso_neto,material,alto_cm,ancho_cm,profundo_cm)
           VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33)`,
          [
            i.nombre,
            i.codigo,
            i.stock,
            i.precio_costo,
            i.precio_venta,
            i.categoria,
            proveedor_id ?? null,
            i.marca ?? null,
            i.medida_peso ?? null,
            i.fecha_vencimiento ?? null,
            i.imagen_url ?? null,
            i.stock_bajo ?? 10,
            i.estado ?? 'Disponible',
            i.talla ?? null,
            i.color ?? null,
            i.genero ?? null,
            i.tipo_tela ?? null,
            i.garantia_dias ?? null,
            i.detalles_clave ?? null,
            i.especificacion_electrica ?? null,
            i.autor ?? null,
            i.editorial ?? null,
            i.isbn_ean ?? null,
            i.formato_libro ?? null,
            i.numero_paginas ?? null,
            i.tipo_mascota ?? null,
            i.tono_aroma ?? null,
            i.tipo_piel_cabello ?? null,
            i.volumen_peso_neto ?? null,
            i.material ?? null,
            i.alto_cm ?? null,
            i.ancho_cm ?? null,
            i.profundo_cm ?? null,
          ]
        );
        inserted++;
      }
    } catch (e: any) {
      errors.push(e.message);
    }
  }

  res.json({ inserted, updated, errors: errors.length, details: errors });
});
