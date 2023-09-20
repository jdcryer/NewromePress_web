import { StringLiteral } from "typescript/lib/tsserverlibrary";

export interface ITask {
	id?: string;
	fk_title: string;
	fk_contactAssigned: string;
	subject: string;
	description: string;
	dueDate: string;
	createdBy: string;
	sentDate: string;
	completeDate: string;
	detail: {response:IComm[]};
	task_file?: ITaskFile[];
	task_contactAssigned?: IContact;
	task_title?: ITitle;
}

export interface ITaskFile {
	name: string;
	path: string;
	fileType: string;
	detail: {};
}

export interface ITitle {
	id?: string;
	name: string;
	description: string;
	originalTitle: string;
	series: boolean;
	volume: string;
	seriesTitle: string;
	pseudonym: string;
	detail: {};
}

export function newTask(): ITask {
	return {
		fk_title: '',
		fk_contactAssigned: '',
		subject: '',
		description: '',
		dueDate: '',
		createdBy: '',
		sentDate: '',
		completeDate: '',
		detail: {response:[]},
		task_file: []
	};
}

export interface ITicketMessage {
	id?: string;
	fk_ticket: string;
	fk_user: string;
	messageRef: string;
	title: string;
	type: string;
	detail: { content: string };
}

export function newTicketMessage(): ITicketMessage {
	return {
		fk_ticket: '',
		fk_user: '',
		messageRef: '',
		title: '',
		type: '',
		detail: { content: '' }
	}
};

export interface IFile {
	id?: string;
	fk_table: string;
	fk_record: string;
	name: string;
	path: string;
	fileType: string;
  }
  
  export function newFile(): IFile {
	  return {
	  fk_table: '',
	  fk_record: '',
	  name: '',
	  path: '',
	  fileType: ''
	  }
  };

  export interface IComm {
	direction: string;
	date: string;
	text: string;
  }
  
  export function newComm(): IComm {
	  return {
	  direction: '',
	  date: '',
	  text: ''
	  }
  };

export interface ILookupList { 
	id?: string;
	fk_client: string;
	name: string;
	detail: {
		values: ILookupValue[];
	};
};

export interface ILookupValue {
	id: string;
	value: string;
}

export function newLookupList(): ILookupList {
	return {
		fk_client: '',
		name: 'New Lookup List',
		detail: {
			values: []
		}
	};
}

export interface ILookupMapping {
	id?: string;
	fk_lookupList: string;
	tableNum: number;
	fieldNum: number;

	tableName?: string;
	fieldName?: string;
}

export function newLookupMapping(): ILookupMapping {
	return {
		fk_lookupList: '',
		tableNum: 0,
		fieldNum: 0,
		tableName: '',
		fieldName: '',
	}
};

export interface IUser {
	id: string;
	tableId: number;
	fk_record: string;
	username: string;
	email: string;
	type: string;
	detail: any;
}

export interface IAddress {
	add1: string;
	add2: string;
	add3: string;
	add4?: string;
	town: string;
	county: string;
	postcode: string;
	countryCode?: string;
	telephone?: string;	
	email?: string;
}

export function newAddress(): IAddress {
	return {
		add1: '',
		add2: '',
		add3: '',		
		add4: '',
		town: '',
		county: '',
		postcode: '',
		countryCode: '',
		telephone: '',
		email: ''
	}
};

export function newCompany(): ICompany {
	return {
		fk_client: '',
		name: '',
    companyType: '',
		active: true,
		addressBusiness: newAddress(),
		addressDelivery: newAddress(),
		detail: {}
	}
};

export interface ICompany {
	id?: string;
	fk_client: string;
	name: string;
  companyType: string;
	active: boolean;
	addressBusiness: IAddress;
	addressDelivery: IAddress;
	detail: any;
	company_contact?: IContact[];
	company_brand?: IBrand[];
}

export function newContact(): IContact {
	return {
		fk_company: '',
		title: '',
		initials: '',
		forename: '',
		surname: '',
		jobTitle: '',
		email: '',
		telephone: '',
		mobile: '',
		active: true,
		detail: {}
	}
};

export interface IContact {
	id?: string;
	fk_company: string;
	title: string;
	initials: string;
	forename: string;	
	surname: string;
	jobTitle: string;
	email: string;
	telephone: string;
	mobile: string;
	detail: any;
	active: boolean;
}

export function newClient(): IClient {
	return {
		code: '',
		name: '',
		address: newAddress(),
		detail: { licenseNumber: 0 }
	}
};

export interface IClient {
	id?: string;
	code: string;
	name: string;
	address: IAddress;
	detail: any;
}

export interface IHost {
	id?: string;
	fk_client: string;
	code: string;
	name: string;
	prefix: string;
	addInfo: string;
  active: boolean;
	detail: {
		departments: IHostDepartment[]
	};
	host_hostBrand?: IHostBrand[];
};

export interface IHostDepartment {
	departmentName: string;
	accountName: string;
	ftpUrl: string;
	salesUsername: string;
	salesPassword: string;
	pluUsername: string;
	pluPassword: string;
	salesProcessTime: string;
	pluProcessTime: string;
};

export function newHostDepartment(): IHostDepartment {
	return {
		departmentName: '',
		accountName: '',
		ftpUrl: '',
		salesUsername: '',
		salesPassword: '',
		pluUsername: '',
		pluPassword: '',
		salesProcessTime: '',
		pluProcessTime: '',
	}
}

export function newHost(): IHost {
	return {
		fk_client: '',
		code: '',
		name: '',
		prefix: '',
		addInfo: '',
    active: false,
		detail: {
			departments: []
		}
	}
}

export interface IHostBrand {
	id?: string;
	fk_host: string;
	fk_brand: string;
	departmentCode: string;
	subDepartmentCode: string;
	subDepartmentName: string;
	dumpCode: string;
	eanPrefix: string;
	ftpUrl: string;
	ftpUsername: string;
	ftpPassword: string;
	filenameExample: string;
	active: boolean;
	stores: boolean;
	web: boolean;
	inactiveTS: string;
	addInfo: string;
	detail: any;
	hostBrand_host?: IHost;
	hostBrand_brand?: IBrand;
}

export function newHostBrand(): IHostBrand {
	return {
		fk_host: '',
		fk_brand: '',
		departmentCode: '',
		subDepartmentCode: '',
		subDepartmentName: '',
		dumpCode: '',
		eanPrefix: '',
		ftpUrl: '',
		ftpUsername: '',
		ftpPassword: '',
		filenameExample: '',
		active: false,
		stores: false,
		web: false,
		inactiveTS: '',
		addInfo: '',
		detail: {}
	}
}

export function newResource(): IResource {
	return {
		fk_client: '',
		name: '',
		type: '',
		detail: {}
	}
};

export interface IResource {
	id?: string;
	fk_client: string;
	name: string;
	type: string;
	detail: any;
}

export function newErrorReport(): IErrorReport {
	return {
		fk_company: '',
		title: '',
		severity: '',
		createdTS: '',
		detail: {}
	}
};

export interface IErrorReport {
	id?: string;
	fk_company: string;
	title: string;
	severity: string;
	createdTS: string;
	detail: any;
}

export interface IBrand {
	id?: string;
	fk_company: string;
	name: string;
	detail: any;
};

export function newBrand(): IBrand {
	return {
		fk_company: '',
		name: '',
		detail: {}
	}
};

export interface IServer {
	id?: string;
	fk_client: string;
	name: string;
	ip: string;
	maxMemory: number;
	usedMemory: number;
	maxUsers: number;
	usedUsers: number;
	addInfo: string;
	detail: any;
}

export function newServer(): IServer {
	return {
		fk_client: '',
		name: '',
		ip: '',
		maxMemory: 0,
		usedMemory: 0,
		maxUsers: 0,
		usedUsers: 0,
		addInfo: '',
		detail: {}	
	}
};

export interface IServerUsage {
	id?: string;
	fk_server: string;
	fk_company: string;
	fk_brand: string;
	appPort: string;
	httpPort: string;
	memory: number;
	users: number;
	ilevelVersion: string;
	licenseNumber: string;
	onStop: boolean;
	active: boolean;
	deactivatedTS: string;
	addInfo: string;
	detail: {
    backupTime: string;
		reservedMemory: number;
		cacheMemory: number;
		minimumMemory: number;
		versions: {
			lastiLEVELVersion: string;
			server4DVersion: string;
			dateUpdated: string;
			lastDateUpdated: string;
			mobileVersion: string;
			scVersion: string;
			lastReleaseNotesVersion: string;
		},
		autoBarcode: boolean;
		manualBarcode: boolean;
		multiBarcode: boolean;
		barcodePrefix: {
			prefix: string;
			retired: boolean;
		}[]
	};
	serverUsage_company?: ICompany;
	serverUsage_brand?: IBrand;
}

export function newServerUsage(): IServerUsage {
	return {
		fk_server: '',
		fk_company: '',
		fk_brand: '',
		appPort: '',
		httpPort: '',
		memory: 0,
		users: 0,
		ilevelVersion: '',
		licenseNumber: '',
		onStop: false,
		active: true,
		deactivatedTS: '',
		addInfo: '',
		detail: {
      backupTime: '',
			reservedMemory: 0,
			cacheMemory: 0,
			minimumMemory: 0,
			versions: {
				lastiLEVELVersion: '',
				server4DVersion: '',
				dateUpdated: '',
				lastDateUpdated: '',
				mobileVersion: '',
				scVersion: '',
				lastReleaseNotesVersion: '',
			},
			autoBarcode: false,
			manualBarcode: false,
			multiBarcode: false,
			barcodePrefix: []
		}
	}
}

export interface INotification {
  id: string;
  fk_user: string;
  fk_record: string;
  title: string;
  type: string;
  message: string;
  createdTS: string;
  read: boolean;
};
