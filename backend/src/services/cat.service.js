const { prisma } = require('../config/database');

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const createCat = async (ownerId, catData) => {
  return await prisma.cat.create({
    data: {
      ...catData,
      ownerId
    }
  });
};

const getCatsByOwner = async (ownerId) => {
  return await prisma.cat.findMany({
    where: { ownerId },
    include: {
      // include basic info about parents to display lineage
      mother: { select: { name: true } },
      father: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
};

const getCatById = async (catId) => {
  const cat = await prisma.cat.findUnique({
    where: { id: catId },
    include: {
      medicalRecords: true,
      mother: true,
      father: true,
      motherOf: { select: { name: true } }, 
      fatherOf: { select: { name: true } }
    }
  });

  if (!cat) throw new AppError('Cat not found', 404);
  const children = [...(cat.motherOf || []), ...(cat.fatherOf || [])];
  
  return { ...cat, children };
};

const updateCat = async (catId, ownerId, updateData) => {
  // verify ownership before updating
  const cat = await prisma.cat.findUnique({ where: { id: catId } });
  if (!cat) throw new AppError('Cat not found', 404);
  if (cat.ownerId !== ownerId) throw new AppError('Not authorized to update this cat', 403);

  return await prisma.cat.update({
    where: { id: catId },
    data: updateData
  });
};

const deleteCat = async (catId, ownerId) => {
  const cat = await prisma.cat.findUnique({ where: { id: catId } });
  if (!cat) throw new AppError('Cat not found', 404);
  if (cat.ownerId !== ownerId) throw new AppError('Not authorized to delete this cat', 403);

  await prisma.cat.delete({ where: { id: catId } });
  return true;
};

module.exports = {
  createCat,
  getCatsByOwner,
  getCatById,
  updateCat,
  deleteCat
};