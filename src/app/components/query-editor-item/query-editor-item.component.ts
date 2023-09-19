import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { IQueryLine, ITableDefinition, IFieldDefinition } from 'src/app/interfaces/smart-data-list';

@Component({
    templateUrl: 'query-editor-item.component.html',
    selector: 'app-query-editor-item',
    styleUrls: [ 'query-editor-item.component.scss' ]
})
export class QueryEditorItemComponent implements OnInit {
    @Input() lineData: IQueryLine;
    @Input() myIndex: number;
    @Input() tableDefinition: ITableDefinition;
    @Input() relatedTableDefinition: ITableDefinition[];
    @Output() deleteClicked = new EventEmitter();
    @Output() conjunctionChanged = new EventEmitter();

    public fieldType: string;
    public conjunctors: string[] = [ '', 'And', 'Or', 'Except' ];
    public operators: string[] = [ '=', '!=', '>', '<', '>=', '<=', 'Contains', 'Is in list' ];
    public isObjectField: boolean = false;
    public isEntityField: boolean = false;
    public relatedFields: IFieldDefinition[] = [];
    public rId: string;
    public lId: string;
    public rBracketState: boolean;
    public lBracketState: boolean;
    private oldConjunction: string = '';

    constructor(private ref: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.getFieldType();
        this.rId = `r${this.myIndex}`;
        this.lId = `l${this.myIndex}`;
    }

    ngAfterViewInit(): void {
        if(this.lineData.bracket !== 'n') {
            $(`#${this.lineData.bracket}${this.myIndex}`).button('toggle');
            document.getElementById(`#${this.lineData.bracket}${this.myIndex}`)?.className
        }
    }

    public buttonDeleteClick(event: any): void {
        this.deleteClicked.emit(this.myIndex);
    }

    public selectFieldChange(event: any): void {
        this.lineData.attribute = '';
        this.getFieldType();
    }

    public selectConjunctionChange(newConj: any): string{
        if((this.oldConjunction !== '') && (newConj === '')){
            this.lineData.conjunction = this.oldConjunction;
        }else if(newConj !== ''){
            this.oldConjunction = newConj;
            this.lineData.conjunction = newConj;
            this.conjunctionChanged.emit({ val: newConj, index: this.myIndex });
        }
        
        return (this.lineData.conjunction) ? this.lineData.conjunction : '';
    }

    public buttonBracketClicked(event: any): void {
        let clickedSide: string = event.target.id
        clickedSide = clickedSide.substr(0, 1);
        if(this.lineData.bracket === 'n'){
            this.lineData.bracket = clickedSide;
        }else{
            if(this.lineData.bracket === clickedSide){
                this.lineData.bracket = 'n';
            }else{
                $(`#${this.lineData.bracket}${this.myIndex}`).button('toggle');
                this.lineData.bracket = clickedSide;
            }
        }
    }

    private getFieldType(): void {
        const idx = this.tableDefinition.fields.findIndex((val) => {
            return (val.name === this.lineData.field);
        });
        if(idx >= 0) {
            if(this.tableDefinition.fields[idx].kind === 'storage') {
                this.fieldType = this.tableDefinition.fields[idx].type;
            }else {
                this.fieldType = this.tableDefinition.fields[idx].kind;
            }
        }
        this.isObjectField = (this.fieldType === 'object');
        this.isEntityField = ((this.fieldType === 'relatedEntity') || (this.fieldType === 'relatedEntities'));
        this.relatedFields = [];

        if(this.isEntityField) {
            let index = this.relatedTableDefinition.findIndex(element => {
                return (element.relationName === this.lineData.field);
            });
            if(index >= 0) this.relatedFields = this.relatedTableDefinition[index].fields;
        }

        switch(this.fieldType) {
            case 'int' :
            case 'real' :
            case 'number' : {
                this.operators = [ '=', '!=', '>', '<', '>=', '<=', 'Is in list' ];
                break;
            }
            case 'date' : {
                this.operators = [ '=', '!=', '>', '<', '>=', '<=', 'Contains' ];
                break;
            }
            default : {
                this.operators = [ '=', '!=', '>', '<', '>=', '<=', 'Contains', 'Is in list' ];
            }
        }
    }

}
