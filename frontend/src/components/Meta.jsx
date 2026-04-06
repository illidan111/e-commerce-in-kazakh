import { Helmet } from 'react-helmet-async';

const Meta = ({ title, description, keywords }) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta name='keyword' content={keywords} />
    </Helmet>
  );
};

Meta.defaultProps = {
  title: 'ProShop-қа қош келдіңіз',
  description: 'Біз ең жақсы өнімдерді арзан бағамен сатамыз',
  keywords: 'электроника, электроника сатып алу, арзан электроника',
};

export default Meta;
