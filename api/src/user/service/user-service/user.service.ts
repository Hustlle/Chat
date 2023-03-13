import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "../../model/user.entity";
import {Repository} from "typeorm";
import {UserI} from "../../model/user.intreface";
import {from, map, mapTo, Observable, switchMap} from "rxjs";
import {IPaginationOptions, paginate, Pagination} from "nestjs-typeorm-paginate";
import {AuthService} from "../../../auth/service/auth.service";
const bcrypt = require('bcrypt');

@Injectable()
export class UserService {


    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private authService: AuthService,
    ) { }

    create(newUser: UserI): Observable<UserI> {
        return this.mailExists(newUser.email).pipe(
            switchMap((exists: boolean) => {
                if(!exists) {
                    return this.hashPassword(newUser.password).pipe(
                        switchMap((passwordHask: string) => {
                            // overwrite the user password with the hash, to store the hash in the database
                            newUser.password = passwordHask
                            return from(this.userRepository.save(newUser)).pipe(
                                 switchMap((user: UserI) => this.findOne(user.id))
                            )
                        })
                    )
                } else {
                    throw  new HttpException('Email is alreade use', HttpStatus.CONFLICT);
                }

            })
        )
    }

    findAll(options: IPaginationOptions): Observable<Pagination<UserI>> {
        return from(paginate<UserEntity>(this.userRepository, options ));
    }


    login(user: UserI): Observable<string> {
        return this.findByEmail(user.email).pipe(
            switchMap((foundUser: UserI) => {
                console.log(foundUser)
                if ( foundUser) {
                    return this.validatePassword(user.password, foundUser.password).pipe(
                        switchMap((matches: boolean) => {
                            if(matches) {
                                return this.findOne(foundUser.id).pipe(
                                    switchMap((payload: UserI) => this.authService.generateJwt(payload)))
                            } else {
                                throw new HttpException('Login was not succesfull', HttpStatus.UNAUTHORIZED)
                            }
                        })
                    )
                } else {
                    throw  new HttpException("User not found", HttpStatus.NOT_FOUND)
                }
            })
        )
    }


    private validatePassword(password: string, storedPasswordHash: string): Observable<any> {
        return this.authService.comparePasswords(password, storedPasswordHash)
    }
    private hashPassword(password: string): Observable<string> {
        return  this.authService.hashPassword(password)
    }
    private mailExists(email: string): Observable<boolean> {
        return from(this.userRepository.findOneBy({ email })).pipe(
            map((user: UserI) => {
                if (user) {
                    return true;
                } else {
                    return false;
                }
            })
        )
    }

    public getOne(id: number): Promise<UserI> {
        console.warn(id)
        return this.userRepository.findOneByOrFail({id});
    }



    private findOne(id: number): Observable<UserI> {
        return from(this.userRepository.findOneBy({id}))
    }

    // also returns the password
    private findByEmail(email: string): Observable<UserI> {
        return from(this.userRepository.findOneBy({ email }));
    }
}
