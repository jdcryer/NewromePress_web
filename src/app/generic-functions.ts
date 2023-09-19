// import { IAddress } from './interfaces/all';

export function concatString(input: string[], delimiter: string): string {
    let response = '';
    input.forEach((a, i) => {
        response += (a) ? `${(i > 0) ? delimiter : ''}${a}` : '';
    });
    return response;
}

// export function concatAddress(input: IAddress, delimiter: string): string {
//     let response = '';
//     const props = Object.getOwnPropertyNames(input);
//     props.forEach((prop, i) => {
//         response += (input[prop]) ? `${ i > 0 ? delimiter : ``}${input[prop]}` : ``;
//     });
//     return response;
// }

export function stripHTML(input: string): string {
    let div = document.createElement('div');
    div.innerHTML = input;
    return div.textContent || div.innerText;
}

export function createAgeString(d: Date): object {
    let returnData = { string: '', num: 0};
    let ageString = "";
    let currentDate = new Date();
    let ageNum = (+currentDate - +d);
    let age = new Date(ageNum);

    if(age.getMonth() > 0)
        ageString = String(age.getMonth()) + 'M ';

    if(age.getDate() > 1)
        ageString += String(age.getDate()-1) + 'd ';

    if(age.getHours() > 1)
        ageString += String(age.getHours()-1) + 'h ';

    ageString += String(age.getMinutes()) + 'm';
    
    returnData.string = ageString;
    returnData.num = ageNum;

    return returnData;
}

export function dateToDateString(d: Date): string {
    let dd = String(d.getDate()).padStart(2, '0');
    let mm = String(d.getMonth() + 1).padStart(2, '0');
    let yyyy = d.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
    // return `${dd}/${mm}/${yyyy}`;
}

export function dateToTimeString(d: Date): string {
    let hh = String(d.getHours()).padStart(2, '0');
    let mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
}

export function dtStringToDate(date: string, time: string = '00:00'): Date {
    let dateParts = date.split('-');
    let timeParts = time.split(':');
    return new Date(+dateParts[0], +dateParts[1] - 1, +dateParts[2], +timeParts[0], +timeParts[1]);
}

export function deepCopy(a: any): any{
    let b: any = {}, params = Object.getOwnPropertyNames(a);
    params.forEach(p => { 
        if(p === 'query'){
            b[p] = a[p].map((aEle: any) => Object.assign({}, aEle));
        }else{
            b[p] = a[p];
        } 
    });
    return b;
}

export function minResult(val: number, min: number): number { 
    return (val < min) ? min : val;
}

export function matchRuleShort(str : string, rule : string) {
    return new RegExp("^" + rule.split("*").join(".*") + "$").test(str);
}