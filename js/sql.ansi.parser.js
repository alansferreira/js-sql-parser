﻿/**
 * The MIT License (MIT) 
 * 
 * Copyright (c) 2016 Alan da Silva Ferreira 
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy 
 * of this software and associated documentation files (the "Software"), to deal 
 * in the Software without restriction, including without limitation the rights 
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell 
 * copies of the Software, and to permit persons to whom the Software is 
 * furnished to do so, subject to the following conditions: 
 * 
 * The above copyright notice and this permission notice shall be included in all 
 * copies or substantial portions of the Software. 
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
 * SOFTWARE. 
 **/


/// <reference path="base.js" />
var sql = {
    ansi: {
        parser: {
            REGEXES: {
                COMMENT: /(\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\/)|(\/\/.*)/g,

                DATABASE_START_POINT: /(((CREATE)|(ALTER)) {1,}(DATABASE)|(USE)) {1,}([a-zA-Z0-9]+)/igm,

                CREATE_TABLE_HEADER: {
                    EXPRESSION: /(CREATE|ALTER) {1,}(TABLE) {1,}(((\[[^\]]+\]|[a-zA-Z0-9_]+)\.(\[[^\]]+\]|[a-zA-Z0-9_]+))|(\[[^\]]+\]|[a-zA-Z0-9_]+))[ ]{0,}\([ ]{0,}/igm,
                    CAPTURES_INDEXES: {
                        COMMAND_TYPE: 1,
                        SCHEMA_NAME: 5,
                        TABLE_NAME: 6,
                        TABLE_NAME_ALTERNATIVE: 7,
                    }
                },
                CONSTRAINT_INLINE: /CONSTRAINT[ ]{0,}(\[{0,}[^\[]+\]{0,})(.+(CLUSTERED)?)?[ ]{0,}\(([^\)]+)\)+/igm,

                TABLE_COLUMN: {
                    EXPRESSION: /(\[[^\]]+\]|[a-zA-Z0-9_]+)[ ]+((\[[^\]]+\]|[a-zA-Z0-9_]+)([ ]{0,}\([ ]{0,}(([0-9]+)([ ]{0,},[ ]{0,}([0-9]))?)[ ]{0,}\))?)([ ]{1,}(PRIMARY[ ]{1,}KEY([ ]{1,}ASC|[ ]{1,}DESC)))?([ ]{1,}(IDENTITY([ ]{0,}\([ ]{0,}([0-9]+)[ ]{0,},[ ]{0,}([0-9]+)[ ]{0,}\))))?([ ]{1,}(NOT[ ]{1,})?NULL)?[ ]{0,}[,]{0,}[ ]{0,}/igm,
                    CAPTURES_INDEXES: {
                        NAME: 1,
                        DATA_TYPE: 3,
                        PRECISION: 6,
                        SCALE: 8,
                        IS_IDENTITY: 13,
                        IDENTITY_SEED: 15,
                        IDENTITY_STEP: 16,
                        IS_PRIMARY: 10,
                        IS_NOT_NULL: 18
                    }
                }

                // COLUMN_SPECIFICATION: /(\[[^\]]+\]|[a-zA-Z0-9_]+)[ ]+((\[[^\]]+\]|[a-zA-Z0-9_]+)([ ]{0,}\([ ]{0,}(([0-9]+)([ ]{0,},[ ]{0,}[0-9])?)[ ]{0,}\))?)(([ ]{1,}(PRIMARY[ ]{1,}KEY([ ]{1,}ASC|[ ]{1,}DESC)))?[ ]{1,}IDENTITY([ ]{0,}\([ ]{0,}[0-9]+[ ]{0,},[ ]{0,}[0-9]+[ ]{0,}\))?[ ]{1,}((NOT[ ]{1,})?NULL))?[ ]{0,}/igm
                //  [id] [int] PRIMARY KEY ASC IDENTITY(1,1)  NOT NULL,

                //	[vFrte] [decimal](10, 2) NULL,
                //	[id] [int] IDENTITY(1,1) NOT NULL,
                //	[dCorri] [datetime] NOT NULL,
                //	[idOrdServc] [int] NULL,
                //	[idIncid] [int] NULL,
                //	[idSttus] [int] NULL,
                //	[dExcl] [datetime] NULL,
                //	[vEspra] [decimal] (10, 2) NULL,
                //	[vCanct] [decimal]  (10 ) NULL,
                //	[qHrEspra] [int] NULL,
            }
        },
        models: {}
    }
};

sql.ansi.models.column = function (initialData) {
    this.name = "";
    this.isPrimary = false;
    this.table = null; //new sql.ansi.models.table();
    this.type = "";
    this.precision = 0;
    this.scale = 0;
    this.isNullable = true;
    this.isAutoIncrement = false;
    this.increment = { seed: 0, step: 1 };

    Object.deepExtend(this, initialData || {});
};

sql.ansi.models.table = function (initialData) {
    this.name = "";
    this.schema = "";
    this.database = null;//new sql.ansi.models.database();
    this.columns = []; //[new sql.ansi.models.column()]
    this.indexes = []; //[new sql.ansi.models.indexContraint()]
    this.foregnKeys = []; //[new sql.ansi.models.foregnKeyContraint()]

    Object.deepExtend(this, initialData || {});
};

sql.ansi.parser.databaseScript = function (scriptData) {

    iterateRegex(sql.ansi.parser.REGEXES.DATABASE_START_POINT, function (regexp, inputText, match) {

    });

};
sql.ansi.parser.columnScript = function (scriptColumns) {

    var columns = [];

    iterateRegex(sql.ansi.parser.REGEXES.TABLE_COLUMN.EXPRESSION, scriptColumns, function (regexp, inputText, match) {
        var columnSpec = match[0];
        var currentColumn = new sql.ansi.models.column({
            name: match[sql.ansi.parser.REGEXES.TABLE_COLUMN.CAPTURES_INDEXES.NAME],
            type: match[sql.ansi.parser.REGEXES.TABLE_COLUMN.CAPTURES_INDEXES.DATA_TYPE],
            precision: match[sql.ansi.parser.REGEXES.TABLE_COLUMN.CAPTURES_INDEXES.PRECISION],
            scale: match[sql.ansi.parser.REGEXES.TABLE_COLUMN.CAPTURES_INDEXES.SCALE],
            isPrimary: !!match[sql.ansi.parser.REGEXES.TABLE_COLUMN.CAPTURES_INDEXES.IS_PRIMARY],
            isAutoIncrement: !!match[sql.ansi.parser.REGEXES.TABLE_COLUMN.CAPTURES_INDEXES.IS_IDENTITY],
            increment: {
                seed: match[sql.ansi.parser.REGEXES.TABLE_COLUMN.CAPTURES_INDEXES.IDENTITY_SEED],
                step: match[sql.ansi.parser.REGEXES.TABLE_COLUMN.CAPTURES_INDEXES.IDENTITY_STEP]
            },
            isNullable: !!match[sql.ansi.parser.REGEXES.TABLE_COLUMN.CAPTURES_INDEXES.IS_NOT_NULL],

            src: columnSpec
        });

        columns.push(currentColumn);

    });

    return columns;
};

sql.ansi.parser.tableScript = function (scriptData) {
    
    //var tbRex = "(CREATE) {1,}(TABLE) {1,}(\[?[a-zA-Z0-9]+\](\[?[a-zA-Z0-9]+\])?)[^\(]+\([ ]{0,}" +
    //                "([ ]{0,}((\[?[a-zA-Z0-9]+\]?) {1,}((\[?[a-zA-Z0-9]+\]?)) {0,}((\([0-9, ]+)\)){0,})[ ]{0,}((IDENTITY[ ]{0,}\([ ]{0,}[0-9]+[,]{0,}[ ]{0,}[0-9]+[ ]{0,}\))){0,}[ ]{0,}[ ]{0,}([NOT]+[ ]{0,}){0,}([NULL]+){0,}[ ]{0,}[,]{0,}[ ]{0,})+";
    //                //"|(CONSTRAINT[ ]{0,}(\[{0,}[^\[]+\]{0,})(.+(CLUSTERED)?)?[ ]{0,}\(([^\)]+)\)+)" +
    //                //colocar aqui as expressoes de constraints
    //            //"\)";

    var tables = [];
    var script = scriptData.toString();
    var offset = 0;

    while (sql.ansi.parser.REGEXES.COMMENT.test(script)) {
        script = script.replace(sql.ansi.parser.REGEXES.COMMENT, "");
    }

    script = script.replaceAll("\t", " ").replaceAll("\r", " ").replaceAll("\n", " ");

    iterateRegex(sql.ansi.parser.REGEXES.CREATE_TABLE_HEADER.EXPRESSION, script, function (regexp, inputText, match) {
        var tableScript = script.substring(match.index, script.indexOfCloser(match.index + match[0].length, "(", ")") + 1);
        var tableConstraints = [];

        var table = new sql.ansi.models.table({
            src: tableScript,
            schema: match[sql.ansi.parser.REGEXES.CREATE_TABLE_HEADER.CAPTURES_INDEXES.SCHEMA_NAME],
            name: match[sql.ansi.parser.REGEXES.CREATE_TABLE_HEADER.CAPTURES_INDEXES.TABLE_NAME] || match[sql.ansi.parser.REGEXES.CREATE_TABLE_HEADER.CAPTURES_INDEXES.TABLE_NAME_ALTERNATIVE]
        });

        tableScript = tableScript.substring(match[0].length);


        //TABLE CONSTRAINTS
        iterateRegex(sql.ansi.parser.REGEXES.CONSTRAINT_INLINE, tableScript, function (regexp, inputText, match) {
            tableConstraints.push(match);

            tableScript = tableScript.substring(0, match.index) + tableScript.substring(match.index + match[0].length);
        });

        ////TABLE COLUMNS
        //iterateRegex(sql.ansi.parser.REGEXES.COLUMN_SPECIFICATION, tableScript, function (regexp, inputText, match) {
        //    table.columns.push(new sql.ansi.parser.columnScript(match[0]));

        //    tableScript = tableScript.substring(0, match.index) + tableScript.substring(match.index + match[0].length);
        //});


        table.columns = sql.ansi.parser.columnScript(tableScript);
        for (var c in table.columns) c.table = table;
        

        tables.push(table);

    });

    return tables;
};

function iterateRegex(regexp, inputText, callback) {
    var matches = [];
    var match = regexp.exec(inputText);
    while (match != null) {

        callback(regexp, inputText, match);

        matches.push(match);
        match = regexp.exec(inputText);
    }

}

/// <summary>the @param start should be after from opener</summary>
String.prototype.indexOfCloser = function findClosesOf(start, opener, closer) {
    var countOpener = 1;
    for (var i = start; i < this.length; i++) {
        if (this[i] == opener) { countOpener++; continue; }
        if (this[i] == closer) {
            countOpener--;
            if (countOpener == 0) {
                return i;
            }
            continue;
        }

    }
}


