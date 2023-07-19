import { Request, Response } from 'express';
import { User } from 'src/models/user.model';

export interface Context {
	user: User;
	req: Request;
	res: Response;
}
