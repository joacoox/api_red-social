import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from '../autenticacion/schemas/user';
import { Publication } from "./schema/publication";

@Injectable()
export class EstadisticasService {

    constructor(
        @InjectModel(Publication.name) private publicationModel: Model<Publication>,
        @InjectModel(User.name) private userModel: Model<User>
    ) { }

    // Cantidad de publicaciones realizadas por cada usuario en un lapso de
    // tiempo. El lapso de tiempo debe poder ser elegido.
    // ■ Cantidad de comentarios realizados en un lapso de tiempo. El lapso de
    // tiempo debe poder ser elegido.
    // ■ Cantidad de comentarios en cada publicación en un lapso de tiempo.El
    // lapso de tiempo debe poder ser elegido.

    async getPublicacionesPorUsuario(from: string, to: string) {
        const dateFilter: any = {};
        if (from) dateFilter.$gte = new Date(from);
        if (to) dateFilter.$lte = new Date(to);

        const pipeline: any[] = [];

        if (Object.keys(dateFilter).length) {
            pipeline.push({ $match: { createdAt: dateFilter } });
        }

        pipeline.push({
            $group: {
                _id: '$userId',
                count: { $sum: 1 }
            }
        });

        const raw = await this.publicationModel.aggregate(pipeline);

        const enriched = await Promise.all(
            raw.map(async (elem: any) => {
                const user = await this.userModel
                    .findById(elem._id)
                    .select('username name')
                    .exec();
                return {
                    userId: elem._id,
                    count: elem.count,
                    username: user?.username ?? null,
                    name: user?.name ?? null
                };
            })
        );

        return enriched;
    }

    async getCantidadTotalComentarios(from: string, to: string) {
       
        const match: any = {};
        if (from) match['comments.createdAt'] = { $gte: new Date(from) };
        if (to) {
            match['comments.createdAt'] = {
                ...(match['comments.createdAt'] || {}),
                $lte: new Date(to)
            };
        }

        const result = await this.publicationModel.aggregate([
            { $unwind: '$comments' },
            { $match: match },
            {
                $group: {
                    _id: null,
                    totalComentarios: { $sum: 1 },
                },
            },
        ]);

        return { totalComentarios: result[0]?.totalComentarios || 0 };
    }

    async getComentariosPorPublicacion(from: string, to: string) {

        const match: any = {};
        if (from) match['comments.createdAt'] = { ...(match['comments.createdAt'] || {}), $gte: new Date(from) };
        if (to) match['comments.createdAt'] = { ...(match['comments.createdAt'] || {}), $lte: new Date(to) };

        return this.publicationModel.aggregate([
       
            { $unwind: '$comments' },
            { $match: match },
            {
                $group: {
                    _id: '$_id',
                    title: { $first: '$title' },
                    cantidadComentarios: { $sum: 1 },
                },
            },
        ]);
    }

}