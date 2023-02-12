import { Injectable } from '@nestjs/common';
import {CreateUserDto} from "../../model/dto/create-user.dto";
import {Observable, of} from "rxjs";
import {UserI} from "../../model/user.intreface";
import {LoginUserDto} from "../../model/dto/login-user.dto";

@Injectable()
export class UserHelperService {
    createUserDtoEntity(createUserDto: CreateUserDto): Observable<UserI> {
        return of({
                email: createUserDto.email,
                username: createUserDto.username,
                password: createUserDto.password
            }
        )
    }

    loginUserDtoEntity(loginUserDto: LoginUserDto): Observable<UserI> {
        return of({
            email: loginUserDto.email,
            password: loginUserDto.password
        })
    }
}
