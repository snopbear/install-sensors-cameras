import { ReactiveFormsModule } from "@angular/forms";
import { AsyncPipe, NgClass } from "@angular/common";


const formsModules = [ReactiveFormsModule];
const commonModules = [NgClass, AsyncPipe];

const loginComponentsImports = [...formsModules, ...commonModules];
export default loginComponentsImports;
