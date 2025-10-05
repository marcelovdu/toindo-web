import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Category from '@/models/category';

// Lista das 10 categorias pré-determinadas
const PREDEFINED_CATEGORIES = [
  {     name: 'Comemoração' },
  {     name: 'Esporte' },
  {     name: 'Música' },
  {     name: 'Comida & Bebida' },
  {     name: 'Hobby' },
  {     name: 'Arte & Cultura' },
  {     name: 'Ar livre' },
  {     name: 'Passeios' },
  {     name: 'Conhecimento' },
  {     name: 'Outros' },
];

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Esta rota é permitida apenas em ambiente de desenvolvimento.' },
      { status: 403 }
    );
  }

  try {
    await connectToDatabase();
    console.log('API de Seed: Conectado ao banco de dados.');

    const results = [];

    for (const categoryData of PREDEFINED_CATEGORIES) {
      const existingCategory = await Category.findOne({ name: categoryData.name });

      if (!existingCategory) {
        await Category.create(categoryData);
        results.push(`Categoria "${categoryData.name}" criada.`);
      } else {
        results.push(`Categoria "${categoryData.name}" já existe. Pulando.`);
      }
    }

    console.log('API de Seed: Seeding concluído.');
    await mongoose.disconnect();

    return NextResponse.json({
      message: 'Seeding de categorias concluído com sucesso!',
      results: results,
    });
  } catch (error) {
    console.error('API de Seed: Erro durante o seeding:', error);
    return NextResponse.json(
      { error: 'Erro durante o seeding de categorias.' },
      { status: 500 }
    );
  }
}