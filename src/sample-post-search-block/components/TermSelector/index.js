import { FormTokenField } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';

function generateTitleToIdMap( termObjects ) {
	if ( ! termObjects ) {
		return [];
	}
	return termObjects.reduce( ( accumulator, currentTerm ) => {
		accumulator[ currentTerm.name ] = currentTerm.id;
		return accumulator;
	}, {} );
}

function generateIdToTitleMap( termObjects ) {
	if ( ! termObjects ) {
		return [];
	}
	return termObjects.reduce( ( accumulator, currentTerm ) => {
		accumulator[ currentTerm.id ] = currentTerm.name;
		return accumulator;
	}, {} );
}

export default function TermSelector( props ) {
	const { taxonomy, value = [], onChange } = props;

	const taxObject = useSelect(
		( select ) => {
			return select( 'core' ).getTaxonomy( taxonomy );
		},
		[ taxonomy ]
	);

	const { taxonomyTermsById, taxonomyTermsByTitle } = useSelect(
		( select ) => {
			const termObjects =
				select( 'core' ).getEntityRecords( 'taxonomy', taxonomy, {
					per_page: 100,
				} ) ?? [];
			return {
				taxonomyTermsById: generateIdToTitleMap( termObjects ),
				taxonomyTermsByTitle: generateTitleToIdMap( termObjects ),
			};
		},
		[ taxonomy ]
	);

	const selectedTerms = value
		.map( ( id ) => taxonomyTermsById[ id ] )
		.filter( Boolean );

	return (
		<div style={ { paddingBottom: 16 } }>
			<FormTokenField
				label={ sprintf(
					__( 'Filter by %s', 'sample-plugin' ),
					taxObject ? taxObject.labels.singular_name : ''
				) }
				suggestions={ Object.values( taxonomyTermsById ) }
				value={ selectedTerms }
				onChange={ ( terms ) => {
					onChange(
						terms.map( ( term ) => taxonomyTermsByTitle[ term ] )
					);
				} }
			/>
		</div>
	);
}
